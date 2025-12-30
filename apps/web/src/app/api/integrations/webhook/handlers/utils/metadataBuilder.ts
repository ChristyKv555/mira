import type { SyncWebhookPayload } from "../types";
import type { FetchResult } from "./recordFetcher";

/**
 * Generates a unique externalId for the source event
 */
export function generateExternalId(payload: SyncWebhookPayload): string {
  // For sync webhooks, create a unique identifier using connectionId + model + timestamp
  // If there's a record ID in the payload (for forwarded webhooks), use that
  return (
    (payload as { id?: string }).id ||
    `${payload.connectionId}-${payload.model}-${payload.syncType}-${Date.now()}`
  );
}

/**
 * Builds metadata object from webhook payload
 */
export function buildMetadata(
  payload: SyncWebhookPayload,
  fetchError: Error | null
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    syncType: payload.syncType,
    responseResults: payload.responseResults,
    model: payload.model,
    connectionId: payload.connectionId,
    providerConfigKey: payload.providerConfigKey,
  };

  if (payload.modifiedAfter) {
    metadata.modifiedAfter = payload.modifiedAfter;
  }

  if (payload.syncVariant) {
    metadata.syncVariant = payload.syncVariant;
  }

  if (payload.endUser) {
    metadata.endUserEmail = payload.endUser.endUserEmail;
    if (payload.endUser.tags) {
      metadata.tags = payload.endUser.tags;
    }
  }

  if (fetchError) {
    metadata.fetchError = fetchError.message;
  }

  return metadata;
}

/**
 * Builds rawContent object with webhook payload and fetched records
 */
export function buildRawContent(
  payload: SyncWebhookPayload,
  fetchResult: FetchResult
): string {
  const rawContentObj = {
    webhookPayload: payload,
    fetchedRecords: fetchResult.records.length > 0 ? fetchResult.records : null,
    recordCount: fetchResult.records.length,
    fetchError: fetchResult.error ? fetchResult.error.message : null,
  };

  return JSON.stringify(rawContentObj);
}
