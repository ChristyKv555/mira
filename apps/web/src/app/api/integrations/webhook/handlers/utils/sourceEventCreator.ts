import { db } from "@/database";
import { sourceEvents } from "@/database/schema";
import type { IntegrationLookupResult } from "./integrationLookup";

export interface CreateSourceEventParams {
  integrationLookup: IntegrationLookupResult;
  externalId: string;
  rawContent: string;
  metadata: string;
}

/**
 * Creates a source event entry in the database
 */
export async function createSourceEvent(
  params: CreateSourceEventParams
): Promise<typeof sourceEvents.$inferSelect> {
  const { integrationLookup, externalId, rawContent, metadata } = params;

  const [newSourceEvent] = await db
    .insert(sourceEvents)
    .values({
      userId: integrationLookup.userId,
      integrationId: integrationLookup.integration.id,
      platform: integrationLookup.platform,
      externalId: externalId,
      rawContent: rawContent,
      metadata: metadata,
      processedAt: null,
    })
    .returning();

  return newSourceEvent;
}

