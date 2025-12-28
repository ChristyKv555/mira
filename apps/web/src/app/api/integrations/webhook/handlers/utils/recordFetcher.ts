import type { SyncWebhookPayload } from "../types";
import { listNangoRecords } from "../../../utils/nangoConnection";
import type { IntegrationLookupResult } from "./integrationLookup";
import { buildModifiedAfter } from "./modifiedAfterBuilder";

export interface FetchResult {
  records: unknown[];
  error: Error | null;
}

export async function fetchNewlyAddedRecords(
  payload: SyncWebhookPayload,
  integrationLookup: IntegrationLookupResult
): Promise<FetchResult> {
  const result: FetchResult = {
    records: [],
    error: null,
  };

  const hasNewRecords = payload.responseResults.added > 0;

  if (!hasNewRecords) {
    console.log("No newly added records detected, skipping record fetch", {
      connectionId: payload.connectionId,
      model: payload.model,
      added: payload.responseResults.added,
    });
    return result;
  }

  try {
    // Get the integration creation date as ISO timestamp
    const modifiedAfter = buildModifiedAfter(integrationLookup);

    // Build listRecords parameters
    // Limit to 50 records per request to manage data flow
    const listRecordsParams = {
      providerConfigKey: payload.providerConfigKey,
      connectionId: payload.connectionId,
      model: payload.model,
      filter: "added" as const,
      modifiedAfter: modifiedAfter,
      limit: 50, // Base limit to restrict data flow
      ...(payload.syncVariant && { variant: payload.syncVariant }),
    };

    // Fetch all records added after the integration was created
    const nangoResult = await listNangoRecords(listRecordsParams);

    if (nangoResult.records && nangoResult.records.length > 0) {
      result.records = nangoResult.records;
    }

    if (nangoResult.error) {
      result.error = nangoResult.error;
    }

    console.log(
      `Fetched ${result.records.length} newly added record(s) for sync webhook`,
      {
        connectionId: payload.connectionId,
        model: payload.model,
        added: payload.responseResults.added,
        updated: payload.responseResults.updated,
        deleted: payload.responseResults.deleted,
        modifiedAfter: modifiedAfter,
      }
    );
  } catch (error) {
    console.error("Error fetching records from Nango:", error);
    result.error = error instanceof Error ? error : new Error(String(error));
  }

  return result;
}
