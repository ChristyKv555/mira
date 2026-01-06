import type { IntegrationLookupResult } from "./integrationLookup";

/**
 * Builds the modifiedAfter timestamp for fetching records
 * Priority:
 * 1. Last sync time from integration metadata (if user has synced before)
 * 2. Integration creation date (for first sync)
 * @param integrationLookup - Integration lookup result containing createdAt and metadata
 * @returns ISO timestamp string for modifiedAfter parameter
 */
export function buildModifiedAfter(
  integrationLookup: IntegrationLookupResult
): string {
  const integration = integrationLookup.integration;
  const metadata = integration.metadata as Record<string, unknown> | null;

  // Check if we have a last sync time stored in metadata
  if (metadata?.lastSyncTime) {
    const lastSyncTime = metadata.lastSyncTime;

    // Convert to ISO string if needed
    if (lastSyncTime instanceof Date) {
      return lastSyncTime.toISOString();
    }

    if (typeof lastSyncTime === "string") {
      return lastSyncTime;
    }
  }

  // Fallback to integration creation date (for first sync or if no lastSyncTime)
  const createdAt = integration.createdAt;

  if (createdAt instanceof Date) {
    return createdAt.toISOString();
  }

  if (typeof createdAt === "string") {
    return createdAt;
  }

  // Final fallback: use current date (shouldn't happen, but safe fallback)
  return new Date().toISOString();
}
