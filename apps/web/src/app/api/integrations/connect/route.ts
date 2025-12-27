import { NextRequest, NextResponse } from "next/server";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { initiateOAuth } from "@/lib/google/oauth";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);

    const body = await request.json();
    const { platform } = body;

    // Validate platform
    if (platform !== "google-calendar" && platform !== "google-mail") {
      return NextResponse.json(
        {
          error: "Invalid platform. Must be 'google-calendar' or 'google-mail'",
        },
        { status: 400 }
      );
    }

    // Generate state parameter for CSRF protection
    // Include platform in state so callback can identify which integration is being connected
    const randomState = randomBytes(32).toString("hex");
    const state = `${randomState}|platform:${platform}`;

    // Store state in a way that can be verified later (you might want to use Redis or session storage)
    // For now, we'll include it in the redirect URL and verify it in the callback
    // In production, consider storing state in a database or session store

    // Generate OAuth URL
    const authUrl = initiateOAuth(platform, state);

    // Redirect to Google OAuth consent screen
    return NextResponse.json({
      authUrl,
      state, // Include state in response for frontend to store temporarily
    });
  } catch (error) {
    console.error("Error initiating OAuth flow:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
