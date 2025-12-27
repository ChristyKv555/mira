import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { integrations, sourceEvents } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { deleteNangoConnection } from "./utils/nangoConnection";

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

export async function DELETE(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("id");

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    // Verify the integration belongs to the user before deleting
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.userId, userData.userId)
        )
      )
      .limit(1);

    if (existingIntegration.length === 0) {
      return NextResponse.json(
        { error: "Integration not found or unauthorized" },
        { status: 404 }
      );
    }

    const integration = existingIntegration[0];

    // Delete the Nango connection first to prevent webhooks from continuing
    const deleteResult = await deleteNangoConnection({
      connectionId: integration.connectionId,
      platform: integration.platform as
        | "slack"
        | "google-calendar"
        | "google-mail",
    });

    if (!deleteResult.success) {
      // Log warning but continue - connection might already be deleted or not exist in Nango
      console.warn(
        `Failed to delete Nango connection ${integration.connectionId}, continuing with database deletion`
      );
    }

    // Before deleting, set integrationId to NULL for all related source events
    // This preserves the source events (which may have already created tasks)
    // while allowing the integration to be deleted
    await db
      .update(sourceEvents)
      .set({ integrationId: null })
      .where(eq(sourceEvents.integrationId, integrationId));

    // Delete the integration from database
    await db
      .delete(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.userId, userData.userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Integration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting integration:", error);
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}
