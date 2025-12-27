import { NextRequest, NextResponse } from "next/server";
import type { NangoWebhookPayload } from "../helpers/types";

/**
 * Handles forwarded webhooks from external APIs
 * These are webhooks that Nango forwards directly from external services
 * (Slack, Gmail, Google Calendar, etc.) to your application
 */
export async function handleForwardedWebhook(
  request: NextRequest,
  payload: NangoWebhookPayload
): Promise<NextResponse> {
  const { connectionId, providerConfigKey, payload: webhookPayload } = payload;

  console.log("Forwarded webhook received:", {
    connectionId,
    providerConfigKey,
    payload: webhookPayload,
  });

  // TODO: Implement forwarded webhook processing
  // This would handle webhooks directly from Slack, Gmail, Google Calendar, etc.
  // Process the webhook payload and create tasks/events accordingly
  //
  // Example implementation:
  // 1. Identify the platform from providerConfigKey
  // 2. Parse the webhook payload based on platform
  // 3. Extract relevant data (e.g., new email, Slack message, calendar event)
  // 4. Create tasks or update database accordingly
  // 5. Return success response

  return NextResponse.json({
    success: true,
    message: "Forwarded webhook received and queued for processing",
  });
}
