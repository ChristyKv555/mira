import type { SyncWebhookPayload, HandlerResponse } from "./types";
import { NextResponse } from "next/server";
import { validateSyncWebhook } from "./utils/validation";
import { lookupIntegration } from "./utils/integrationLookup";
import { fetchNewlyAddedRecords } from "./utils/recordFetcher";
import {
  generateExternalId,
  buildMetadata,
  buildRawContent,
} from "./utils/metadataBuilder";
import { createSourceEvent } from "./utils/sourceEventCreator";
import { updateLastSyncTime } from "./utils/lastSyncUpdater";

export async function handleSyncWebhook(
  payload: SyncWebhookPayload
): Promise<HandlerResponse> {
  console.log("handleSyncWebhook", payload);

  try {
    // Step 1: Validate webhook payload
    const validationError = validateSyncWebhook(payload);
    if (validationError) {
      return validationError;
    }

    // Step 2: Lookup integration and resolve userId
    const integrationLookupResult = await lookupIntegration(payload);
    if (integrationLookupResult instanceof NextResponse) {
      // Error response returned
      return integrationLookupResult;
    }

    // Step 3: Fetch records added after last sync (or integration creation for first sync)
    // Uses lastSyncTime from metadata if available, otherwise uses integration.createdAt
    const fetchResult = await fetchNewlyAddedRecords(
      payload,
      integrationLookupResult
    );

    // Step 4: Update last sync time after fetching records (even if no records found)
    // This ensures we track sync progress and don't re-fetch old records
    await updateLastSyncTime(
      integrationLookupResult,
      payload.modifiedAfter ? new Date(payload.modifiedAfter) : undefined
    );

    // If there are records to process, continue with the flow
    if (fetchResult.records.length > 0) {
      // Step 5: Build metadata and rawContent
      const externalId = generateExternalId(payload);
      const metadataObj = buildMetadata(payload, fetchResult.error);
      const metadata = JSON.stringify(metadataObj);
      const rawContent = buildRawContent(payload, fetchResult);

      // Step 6: Create source event in database
      const newSourceEvent = await createSourceEvent({
        integrationLookup: integrationLookupResult,
        externalId,
        rawContent,
        metadata,
      });
      // Step 7: Return success response
      return NextResponse.json({
        message: "Sync webhook processed successfully",
        sourceEventId: newSourceEvent.id,
        recordsFetched: fetchResult.records.length,
        fetchError: fetchResult.error ? fetchResult.error.message : null,
      });
    }

    // If there are no records to process, return success response
    return NextResponse.json({
      message:
        "Sync webhook processed successfully - no new records to process",
      recordsFetched: fetchResult.records.length,
      fetchError: fetchResult.error ? fetchResult.error.message : null,
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
