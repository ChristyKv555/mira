import type { SyncWebhookPayload } from "../types";
import { NextResponse } from "next/server";
import type { HandlerResponse } from "../types";

/**
 * Validates the sync webhook payload
 */
export function validateSyncWebhook(
  payload: SyncWebhookPayload
): HandlerResponse | null {
  if (!payload.connectionId || !payload.providerConfigKey || !payload.model) {
    return NextResponse.json(
      {
        message: "Validation failed",
        error: "Missing required sync webhook fields",
      },
      { status: 400 }
    );
  }

  return null; // Validation passed
}

