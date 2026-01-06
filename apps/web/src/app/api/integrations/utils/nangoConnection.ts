import { Nango } from "@nangohq/node";
import { mapPlatformToNangoIntegrationId } from "@/app/dashboard/connect/constants";
import type {
  DeleteConnectionParams,
  DeleteConnectionResult,
  CreateSessionParams,
  CreateSessionResult,
  ListRecordsParams,
  ListRecordsResult,
} from "./types";

const nango = new Nango({
  secretKey: process.env.NANGO_SECRET_KEY!,
});

/**
 * Creates a Nango connect session for user authentication
 * @param params - Session creation parameters
 * @returns Session data including token, connect link, and expiration
 */
export async function createNangoSession(
  params: CreateSessionParams
): Promise<CreateSessionResult> {
  const integrationId = mapPlatformToNangoIntegrationId(params.platform);

  const session = await nango.createConnectSession({
    end_user: {
      id: params.userId,
      email: params.email,
    },
    allowed_integrations: [integrationId],
  });

  return {
    sessionToken: session.data.token,
    connectLink: session.data.connect_link,
    expiresAt: session.data.expires_at,
  };
}

/**
 * Deletes a Nango connection to prevent webhooks from continuing after disconnection
 * @param params - Connection deletion parameters
 * @returns Result indicating success or failure
 */
export async function deleteNangoConnection(
  params: DeleteConnectionParams
): Promise<DeleteConnectionResult> {
  try {
    const providerConfigKey = mapPlatformToNangoIntegrationId(params.platform);

    await nango.deleteConnection(providerConfigKey, params.connectionId);

    console.log(
      `Successfully deleted Nango connection: ${params.connectionId} for platform: ${params.platform}`
    );

    return { success: true };
  } catch (error) {
    // Log the error but return it so caller can decide how to handle
    console.error(
      `Error deleting Nango connection ${params.connectionId}:`,
      error
    );

    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Lists records from Nango for a given connection
 * @param params - Parameters for listing records
 * @returns Records and error if any
 */
export async function listNangoRecords(
  params: ListRecordsParams
): Promise<ListRecordsResult> {
  const result: ListRecordsResult = {
    records: [],
    error: null,
  };

  try {
    const nangoResult = await nango.listRecords(params);

    if (nangoResult.records && nangoResult.records.length > 0) {
      result.records = nangoResult.records;
    }
  } catch (error) {
    result.error = error instanceof Error ? error : new Error(String(error));
  }

  return result;
}

/**
 * Verifies a Nango webhook request
 * @param body - Webhook body
 * @param headers - Webhook headers
 * @returns True if the webhook request is valid, false otherwise
 */
export function verifyNangoWebhookRequest(
  body: string,
  headers: Record<string, string>
): boolean {
  return nango.verifyIncomingWebhookRequest(body, headers);
}
