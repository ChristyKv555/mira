import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);

    // Fetch user's integrations
    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, userData.userId));

    return NextResponse.json({
      integrations: userIntegrations,
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
