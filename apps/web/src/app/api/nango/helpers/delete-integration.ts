import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { extractUserData } from "@/app/api/utils/extractor";
import type { DeleteIntegrationParams } from "./types";

/**
 * Handles deletion/deactivation of an integration from Nango webhook
 * Verifies userId matches before deactivating (security check)
 */
export async function handleDeleteIntegration(
  request: NextRequest,
  params: DeleteIntegrationParams
): Promise<NextResponse> {
  const { connectionId } = params;

  // Try to extract userId from middleware headers (may not be available for webhooks)
  const userData = extractUserData(request);
  const userId = userData?.userId;

  if (!connectionId) {
    console.error("Missing connectionId for integration deletion");
    return NextResponse.json(
      { error: "Missing required field: connectionId" },
      { status: 400 }
    );
  }

  // Find the integration by connectionId
  const existingIntegration = await db
    .select()
    .from(integrations)
    .where(eq(integrations.connectionId, connectionId))
    .limit(1);

  if (existingIntegration.length === 0) {
    console.log("Integration not found for deletion:", connectionId);
    return NextResponse.json({
      success: true,
      message: "Integration not found (may already be deleted)",
    });
  }

  const integration = existingIntegration[0];

  // If userId is available from middleware, verify it matches
  // This adds an extra security layer for webhook requests
  if (userId && integration.userId !== userId) {
    console.error("User ID mismatch for integration deletion:", {
      connectionId,
      expectedUserId: integration.userId,
      providedUserId: userId,
    });
    return NextResponse.json(
      { error: "Unauthorized: User ID mismatch" },
      { status: 403 }
    );
  }

  // Deactivate the integration instead of deleting (soft delete)
  const updateConditions = userId
    ? and(
        eq(integrations.connectionId, connectionId),
        eq(integrations.userId, userId)
      )
    : eq(integrations.connectionId, connectionId);

  const [updatedIntegration] = await db
    .update(integrations)
    .set({ isActive: 0 })
    .where(updateConditions)
    .returning();

  console.log("Integration deactivated:", {
    id: updatedIntegration.id,
    connectionId,
    userId: updatedIntegration.userId,
  });

  return NextResponse.json({
    success: true,
    message: "Integration deactivated successfully",
    integration: updatedIntegration,
  });
}
