import { NextRequest, NextResponse } from "next/server";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { createNangoSession } from "../../utils/nangoConnection";

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

    // Create a connect session with Nango
    const session = await createNangoSession({
      userId: userData.userId,
      email: userData.email,
      platform: platform as "slack" | "google-calendar" | "google-mail",
    });

    return NextResponse.json({
      sessionToken: session.sessionToken,
      connectLink: session.connectLink,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("Error creating Nango session:", error);
    return NextResponse.json(
      { error: "Failed to create connection session" },
      { status: 500 }
    );
  }
}
