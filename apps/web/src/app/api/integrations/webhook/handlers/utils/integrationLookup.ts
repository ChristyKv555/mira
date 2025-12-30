import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { mapNangoIntegrationIdToPlatform } from "@/app/dashboard/connect/constants";
import type { SyncWebhookPayload } from "../types";
import { NextResponse } from "next/server";
import type { HandlerResponse } from "../types";

export interface IntegrationLookupResult {
  integration: typeof integrations.$inferSelect;
  userId: string;
  platform: "slack" | "google-calendar" | "google-mail";
}

/**
 * Looks up the integration and resolves the userId
 */
export async function lookupIntegration(
  payload: SyncWebhookPayload
): Promise<HandlerResponse | IntegrationLookupResult> {
  // Map providerConfigKey to platform
  const platform = mapNangoIntegrationIdToPlatform(payload.providerConfigKey);

  // Lookup integration using connectionId and providerConfigKey
  const integrationResults = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.connectionId, payload.connectionId),
        eq(integrations.platform, platform)
      )
    )
    .limit(1);

  if (integrationResults.length === 0) {
    return NextResponse.json(
      {
        message: "Integration not found",
        error: `Integration not found for connectionId: ${payload.connectionId} and platform: ${platform}`,
      },
      { status: 404 }
    );
  }

  const integration = integrationResults[0];

  // Use endUserId from payload if available, otherwise get from integration record
  const userId = payload.endUser?.endUserId || integration.userId;

  return {
    integration,
    userId,
    platform,
  };
}
