import { NextRequest, NextResponse } from "next/server";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import {
  revokeToken,
  getCalendarClient,
  getGmailClient,
} from "@/lib/google/oauth";
import type { TokenMetadata } from "@/lib/google/tokenManager";

interface IntegrationMetadata extends TokenMetadata {
  watchResourceId?: string;
  watchHistoryId?: string;
  watchExpiration?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();
    const { integrationId } = body;

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    // Find the integration
    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.userId, userData.userId)
        )
      )
      .limit(1);

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const metadata = integration.metadata as IntegrationMetadata;
    const platform = integration.platform;

    // Revoke Google OAuth tokens
    try {
      if (metadata.accessToken) {
        await revokeToken(metadata.accessToken);
      }
    } catch (error) {
      console.error("Error revoking token:", error);
      // Continue with cleanup even if revocation fails
    }

    // Stop Pub/Sub watch subscriptions
    try {
      if (platform === "google-calendar" && metadata.watchResourceId) {
        const calendar = getCalendarClient(
          metadata.accessToken,
          metadata.refreshToken
        );

        // Stop the watch subscription
        await calendar.channels.stop({
          requestBody: {
            id: metadata.watchResourceId,
            resourceId: metadata.watchResourceId,
          },
        });
      } else if (platform === "google-mail" && metadata.watchHistoryId) {
        const gmail = getGmailClient(
          metadata.accessToken,
          metadata.refreshToken
        );

        // Stop the watch subscription
        await gmail.users.stop({
          userId: "me",
        });
      }
    } catch (error) {
      console.error("Error stopping watch subscription:", error);
      // Continue with cleanup even if stopping watch fails
    }

    // Delete the integration record from the database
    await db.delete(integrations).where(eq(integrations.id, integrationId));

    return NextResponse.json({
      success: true,
      message: "Integration disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}
