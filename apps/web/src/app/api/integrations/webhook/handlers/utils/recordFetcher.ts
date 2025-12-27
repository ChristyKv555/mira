import type { SyncWebhookPayload } from "../types";
import { listNangoRecords } from "../../../utils/nangoConnection";

export interface FetchResult {
  records: unknown[];
  error: Error | null;
}

/**
 * Fetches newly added records from Nango
 */
export async function fetchNewlyAddedRecords(
  payload: SyncWebhookPayload
): Promise<FetchResult> {
  const result: FetchResult = {
    records: [],
    error: null,
  };

  // Only fetch records if there are newly added records
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
    // Build listRecords parameters
    const listRecordsParams: {
      providerConfigKey: string;
      connectionId: string;
      model: string;
      variant?: string;
      filter: "added";
      limit: number;
    } = {
      providerConfigKey: payload.providerConfigKey,
      connectionId: payload.connectionId,
      model: payload.model,
      filter: "added", // Only fetch newly added records, not old ones
      limit: 1, // Only fetch the most recent added record
    };

    if (payload.syncVariant) {
      listRecordsParams.variant = payload.syncVariant;
    }

    // Fetch only the most recent newly added record (no pagination)
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
      }
    );
  } catch (error) {
    console.error("Error fetching records from Nango:", error);
    result.error = error instanceof Error ? error : new Error(String(error));
  }

  return result;
}
