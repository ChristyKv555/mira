import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { extractUserData } from "@/app/api/utils/extractor";
import { mapIntegrationIdToPlatform, type Platform } from "./platform-mapper";
import type { CreateIntegrationParams } from "./types";

/**
 * Handles creation of a new integration from Nango webhook
 * Prefers userId from middleware headers, falls back to endUserId from webhook
 */
export async function handleCreateIntegration(
  request: NextRequest,
  params: CreateIntegrationParams
): Promise<NextResponse> {
  const { connectionId, integrationId, endUserId } = params;

  // Try to extract userId from middleware headers first (preferred)
  // If not available (webhook from Nango), use endUserId from webhook payload
  const userData = extractUserData(request);
  const userId = userData?.userId || endUserId;

  // Map integration ID to platform name
  const platform = mapIntegrationIdToPlatform(integrationId);

  // Validate required fields
  if (!connectionId || !integrationId || !userId) {
    console.error("Missing required fields for integration creation:", {
      connectionId,
      integrationId,
      userId,
    });
    return NextResponse.json(
      {
        error:
          "Missing required fields: connectionId, integrationId, and userId are required",
      },
      { status: 400 }
    );
  }

  // Check if integration already exists for this user and connection
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

  if (existingIntegration.length > 0) {
    console.log("Integration already exists for user:", {
      connectionId,
      userId,
      platform,
    });
    return NextResponse.json({
      success: true,
      message: "Integration already exists",
      integration: existingIntegration[0],
    });
  }

  // Create new integration record
  const [newIntegration] = await db
    .insert(integrations)
    .values({
      userId,
      platform: platform as Platform,
      nangoConnectionId: connectionId,
      isActive: 1,
    })
    .returning();

  console.log("Integration created successfully:", {
    id: newIntegration.id,
    connectionId,
    userId,
    platform,
  });

  return NextResponse.json({
    success: true,
    message: "Integration saved successfully",
    integration: newIntegration,
  });
}
