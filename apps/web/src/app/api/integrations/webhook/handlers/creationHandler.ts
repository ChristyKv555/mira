import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { mapNangoIntegrationIdToPlatform } from "@/app/dashboard/connect/constants";
import type { AuthWebhookPayload, HandlerResponse } from "./types";
import { NextResponse } from "next/server";

export async function handleCreationWebhook(
  payload: AuthWebhookPayload
): Promise<HandlerResponse> {
  try {
    // Validate required fields
    if (
      !payload.success ||
      !payload.connectionId ||
      !payload.providerConfigKey
    ) {
      return NextResponse.json(
        {
          message: "Validation failed",
          error: "Missing required webhook fields",
        },
        { status: 400 }
      );
    }

    // Validate endUserId is present
    if (!payload.endUser?.endUserId) {
      return NextResponse.json(
        {
          message: "Validation failed",
          error: "Missing endUserId in webhook payload",
        },
        { status: 400 }
      );
    }

    const userId = payload.endUser.endUserId;

    // Map Nango integration ID to platform
    const platform = mapNangoIntegrationIdToPlatform(payload.providerConfigKey);

    // Extract metadata (exclude standard fields)
    const metadata: Record<string, unknown> = {};
    Object.keys(payload).forEach((key) => {
      if (
        ![
          "type",
          "operation",
          "success",
          "connectionId",
          "providerConfigKey",
          "endUser",
        ].includes(key)
      ) {
        metadata[key] = payload[key];
      }
    });

    // Add endUser info to metadata if available
    if (payload.endUser) {
      metadata.endUserEmail = payload.endUser.endUserEmail;
      if (payload.endUser.tags) {
        metadata.tags = payload.endUser.tags;
      }
    }

    // Check if connection already exists for this user and platform
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.platform, platform)
        )
      )
      .limit(1);

    if (existingIntegration.length > 0) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          connectionId: payload.connectionId,
          metadata: metadata,
          isActive: 1,
        })
        .where(eq(integrations.id, existingIntegration[0].id));

      return NextResponse.json({
        message: "Integration updated",
        integrationId: existingIntegration[0].id,
      });
    } else {
      // Create new integration
      const [newIntegration] = await db
        .insert(integrations)
        .values({
          userId: userId,
          platform: platform,
          connectionId: payload.connectionId,
          metadata: metadata,
          isActive: 1,
        })
        .returning();

      return NextResponse.json({
        message: "Integration created",
        integrationId: newIntegration.id,
      });
    }
  } catch (error) {
    console.error("Error processing creation webhook:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: "Failed to process creation webhook",
      },
      { status: 500 }
    );
  }
}
