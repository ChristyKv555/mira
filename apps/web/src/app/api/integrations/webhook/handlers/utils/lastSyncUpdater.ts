import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq } from "drizzle-orm";
import type { IntegrationLookupResult } from "./integrationLookup";

/**
 * Updates the last sync time in integration metadata
 * This tracks when we last synced webhooks so we can fetch only new records next time
 * @param integrationLookup - Integration lookup result
 * @param syncTime - Optional timestamp (defaults to current time)
 */
export async function updateLastSyncTime(
  integrationLookup: IntegrationLookupResult,
  syncTime?: Date | string
): Promise<void> {
  const integration = integrationLookup.integration;
  const currentMetadata =
    (integration.metadata as Record<string, unknown>) || {};

  // Use provided sync time or current time
  const lastSyncTime = syncTime
    ? typeof syncTime === "string"
      ? syncTime
      : syncTime.toISOString()
    : new Date().toISOString();

  // Update metadata with last sync time
  const updatedMetadata = {
    ...currentMetadata,
    lastSyncTime: lastSyncTime,
  };

  // Update the integration record
  await db
    .update(integrations)
    .set({ metadata: updatedMetadata })
    .where(eq(integrations.id, integration.id));
}
