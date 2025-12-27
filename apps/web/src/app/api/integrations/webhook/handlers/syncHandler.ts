import { db } from "@/database";
import { integrations, sourceEvents } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { mapNangoIntegrationIdToPlatform } from "@/app/dashboard/connect/constants";
import type { SyncWebhookPayload, HandlerResponse } from "./types";
import { NextResponse } from "next/server";

export async function handleSyncWebhook(
  payload: SyncWebhookPayload
): Promise<HandlerResponse> {
  console.log("handleSyncWebhook", payload);
  try {
    // Validate required fields
    if (!payload.connectionId || !payload.providerConfigKey || !payload.model) {
      return NextResponse.json(
        {
          message: "Validation failed",
          error: "Missing required sync webhook fields",
        },
        { status: 400 }
      );
    }

    // Map providerConfigKey to platform
    const platform = mapNangoIntegrationIdToPlatform(payload.providerConfigKey);

    // Lookup integration using connectionId and providerConfigKey
    const integration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.connectionId, payload.connectionId),
          eq(integrations.platform, platform)
        )
      )
      .limit(1);

    if (integration.length === 0) {
      return NextResponse.json(
        {
          message: "Integration not found",
          error: `Integration not found for connectionId: ${payload.connectionId} and platform: ${platform}`,
        },
        { status: 404 }
      );
    }

    const integrationRecord = integration[0];

    // Use endUserId from payload if available, otherwise get from integration record
    const userId = payload.endUser?.endUserId || integrationRecord.userId;

    // Extract externalId from payload
    // For sync webhooks, create a unique identifier using connectionId + model + timestamp
    // If there's a record ID in the payload (for forwarded webhooks), use that
    const externalId =
      (payload as { id?: string }).id ||
      `${payload.connectionId}-${payload.model}-${payload.syncType}-${Date.now()}`;

    // Prepare metadata object with sync-specific information
    const metadataObj: Record<string, unknown> = {
      syncType: payload.syncType,
      responseResults: payload.responseResults,
      model: payload.model,
      connectionId: payload.connectionId,
      providerConfigKey: payload.providerConfigKey,
    };

    if (payload.modifiedAfter) {
      metadataObj.modifiedAfter = payload.modifiedAfter;
    }

    if (payload.endUser) {
      metadataObj.endUserEmail = payload.endUser.endUserEmail;
      if (payload.endUser.tags) {
        metadataObj.tags = payload.endUser.tags;
      }
    }

    // Store full webhook payload as rawContent
    const rawContent = JSON.stringify(payload);

    // Store metadata as JSON string
    const metadata = JSON.stringify(metadataObj);

    // Create sourceEvent entry
    const [newSourceEvent] = await db
      .insert(sourceEvents)
      .values({
        userId: userId,
        integrationId: integrationRecord.id,
        platform: platform,
        externalId: externalId,
        rawContent: rawContent,
        metadata: metadata,
        processedAt: null,
      })
      .returning();

    return NextResponse.json({
      message: "Sync webhook processed successfully",
      sourceEventId: newSourceEvent.id,
    });
  } catch (error) {
    console.error("Error processing sync webhook:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: "Failed to process sync webhook",
      },
      { status: 500 }
    );
  }
}
