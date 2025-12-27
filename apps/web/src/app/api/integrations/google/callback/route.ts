import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  handleOAuthCallback,
  getCalendarClient,
  getGmailClient,
} from "@/lib/google/oauth";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase session (since callback comes from Google, not authenticated request)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const requestUrl = new URL(request.url);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?redirect=${encodeURIComponent(requestUrl.pathname + requestUrl.search)}`
      );
    }

    const userData = {
      userId: user.id,
      email: user.email || "",
    };
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");
    const error = requestUrl.searchParams.get("error");

    // Extract platform from query param or state
    let platform = requestUrl.searchParams.get("platform") as
      | "google-calendar"
      | "google-mail"
      | null;

    // If platform not in query, try to extract from state
    if (!platform && state) {
      const platformMatch = state.match(
        /platform:(google-calendar|google-mail)/
      );
      if (platformMatch) {
        platform = platformMatch[1] as "google-calendar" | "google-mail";
      }
    }

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/dashboard/connect?error=${encodeURIComponent(error)}`
      );
    }

    // Validate required parameters
    if (!code || !platform) {
      return NextResponse.redirect(
        `${requestUrl.origin}/dashboard/connect?error=${encodeURIComponent("Missing required parameters")}`
      );
    }

    // Exchange authorization code for tokens
    const tokens = await handleOAuthCallback(code);

    // Get user info from Google to use as connectionId
    let connectionId = userData.email; // Fallback to email
    let userEmail = userData.email;

    try {
      // Try to get user info from Google
      if (platform === "google-calendar") {
        const calendar = getCalendarClient(
          tokens.accessToken,
          tokens.refreshToken
        );
        const calendarList = await calendar.calendarList.list();
        if (calendarList.data.items && calendarList.data.items.length > 0) {
          connectionId = calendarList.data.items[0].id || userData.email;
        }
      } else if (platform === "google-mail") {
        const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken);
        const profile = await gmail.users.getProfile({ userId: "me" });
        if (profile.data.emailAddress) {
          connectionId = profile.data.emailAddress;
          userEmail = profile.data.emailAddress;
        }
      }
    } catch (error) {
      console.error("Error fetching user info from Google:", error);
      // Continue with fallback connectionId
    }

    // Check if integration already exists
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userData.userId),
          eq(integrations.platform, platform)
        )
      )
      .limit(1);

    const metadata = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
      scope: tokens.scope,
      userEmail,
      connectedAt: new Date().toISOString(),
    };

    if (existingIntegration.length > 0) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          connectionId,
          metadata,
          isActive: 1,
        })
        .where(eq(integrations.id, existingIntegration[0].id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId: userData.userId,
        platform,
        connectionId,
        metadata,
        isActive: 1,
      });
    }

    // Set up Pub/Sub watch subscriptions
    try {
      const pubsubTopic = process.env.GOOGLE_PUBSUB_TOPIC;
      const webhookUrl = `${requestUrl.origin}/api/webhooks/google`;

      if (platform === "google-calendar" && pubsubTopic) {
        const calendar = getCalendarClient(
          tokens.accessToken,
          tokens.refreshToken
        );

        // Create watch request for calendar events
        const watchResponse = await calendar.events.watch({
          calendarId: "primary",
          requestBody: {
            id: `calendar-${userData.userId}-${Date.now()}`,
            type: "web_hook",
            address: webhookUrl,
          },
        });

        // Store watch resource ID and expiration
        if (watchResponse.data.resourceId && watchResponse.data.expiration) {
          await db
            .update(integrations)
            .set({
              metadata: {
                ...metadata,
                watchResourceId: watchResponse.data.resourceId,
                watchExpiration: watchResponse.data.expiration,
              },
            })
            .where(
              and(
                eq(integrations.userId, userData.userId),
                eq(integrations.platform, platform)
              )
            );
        }
      } else if (platform === "google-mail" && pubsubTopic) {
        const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken);

        // Create watch request for Gmail
        const watchResponse = await gmail.users.watch({
          userId: "me",
          requestBody: {
            topicName: `projects/${process.env.GOOGLE_PUBSUB_PROJECT_ID}/topics/${pubsubTopic}`,
            labelIds: ["INBOX"], // Watch for inbox messages
          },
        });

        // Store watch history ID and expiration
        if (watchResponse.data.historyId && watchResponse.data.expiration) {
          await db
            .update(integrations)
            .set({
              metadata: {
                ...metadata,
                watchHistoryId: watchResponse.data.historyId,
                watchExpiration: watchResponse.data.expiration,
              },
            })
            .where(
              and(
                eq(integrations.userId, userData.userId),
                eq(integrations.platform, platform)
              )
            );
        }
      }
    } catch (watchError) {
      console.error("Error setting up watch subscription:", watchError);
      // Don't fail the entire flow if watch setup fails
      // User can still use the integration, just won't get real-time notifications
    }

    // Redirect back to connect page with success
    return NextResponse.redirect(
      `${requestUrl.origin}/dashboard/connect?success=true&platform=${platform}`
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      `${requestUrl.origin}/dashboard/connect?error=${encodeURIComponent("Failed to complete OAuth flow")}`
    );
  }
}
