import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { mapPlatformToNangoIntegrationId } from "@/app/dashboard/connect/constants";

const nango = new Nango({
  secretKey: process.env.NANGO_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    // Map platform to Nango integration ID
    let integrationId: string;
    try {
      integrationId = mapPlatformToNangoIntegrationId(
        platform as "slack" | "google-calendar" | "google-mail"
      );
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid platform: ${platform}` },
        { status: 400 }
      );
    }

    // Create a connect session with Nango
    const session = await nango.createConnectSession({
      end_user: {
        id: userData.userId,
        email: userData.email,
      },
      allowed_integrations: [integrationId],
    });

    return NextResponse.json({
      sessionToken: session.data.token,
      connectLink: session.data.connect_link,
      expiresAt: session.data.expires_at,
    });
  } catch (error) {
    console.error("Error creating Nango session:", error);
    return NextResponse.json(
      { error: "Failed to create connection session" },
      { status: 500 }
    );
  }
}
