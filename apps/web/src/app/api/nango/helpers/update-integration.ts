import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import type { UpdateIntegrationParams } from "./types";

/**
 * Handles updates to an existing integration
 * Requires userId from middleware for security
 */
export async function handleUpdateIntegration(
  request: NextRequest,
  params: UpdateIntegrationParams
): Promise<NextResponse> {
  const { connectionId, updates } = params;

  // Extract userId from middleware headers (required for updates)
  const userData = extractUserDataOrThrow(request);
  const userId = userData.userId;

  if (!connectionId) {
    return NextResponse.json(
      { error: "Missing required field: connectionId" },
      { status: 400 }
    );
  }

  // Find the integration and verify ownership
  const existingIntegration = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.nangoConnectionId, connectionId),
        eq(integrations.userId, userId)
      )
    )
    .limit(1);

  if (existingIntegration.length === 0) {
    return NextResponse.json(
      { error: "Integration not found or access denied" },
      { status: 404 }
    );
  }

  // Update the integration
  const [updatedIntegration] = await db
    .update(integrations)
    .set(updates)
    .where(
      and(
        eq(integrations.nangoConnectionId, connectionId),
        eq(integrations.userId, userId)
      )
    )
    .returning();

  console.log("Integration updated:", {
    id: updatedIntegration.id,
    connectionId,
    userId,
    updates,
  });

  return NextResponse.json({
    success: true,
    message: "Integration updated successfully",
    integration: updatedIntegration,
  });
}

