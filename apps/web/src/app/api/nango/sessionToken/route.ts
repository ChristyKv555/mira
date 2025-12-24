import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const userData = extractUserDataOrThrow(request);

    const body = await request.json();
    const { integrationId } = body;

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    // Create a connect session with Nango
    const session = await nango.createConnectSession({
      end_user: {
        id: userData.userId,
        email: userData.email || undefined,
      },
      allowed_integrations: [integrationId],
    });

    return NextResponse.json({
      sessionToken: session.data.token,
    });
  } catch (error) {
    console.error("Error creating session token:", error);
    return NextResponse.json(
      { error: "Failed to create session token" },
      { status: 500 }
    );
  }
}
