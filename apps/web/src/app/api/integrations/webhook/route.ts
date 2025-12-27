import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { mapNangoIntegrationIdToPlatform } from "@/app/dashboard/connect/constants";

const nango = new Nango({
  secretKey: process.env.NANGO_SECRET_KEY!,
});

interface NangoWebhookPayload {
  type: string;
  operation: string;
  success: boolean;
  connectionId?: string;
  providerConfigKey?: string;
  endUser?: {
    endUserId?: string;
    endUserEmail?: string;
    tags?: Record<string, unknown>;
  };
  [key: string]: unknown; // Allow additional metadata fields
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const payload: NangoWebhookPayload = JSON.parse(body);

    // Convert headers to plain object for verification
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify the webhook request signature
    const isValid = nango.verifyIncomingWebhookRequest(body, headers);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Only handle auth creation events
    if (payload.type !== "auth" || payload.operation !== "creation") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    if (
      !payload.success ||
      !payload.connectionId ||
      !payload.providerConfigKey
    ) {
      return NextResponse.json(
        { error: "Missing required webhook fields" },
        { status: 400 }
      );
    }

    const userId = payload.endUser?.endUserId;
    if (!userId) {
      return NextResponse.json(
        { error: "Missing endUserId in webhook payload" },
        { status: 400 }
      );
    }

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
    console.error("Error processing Nango webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
