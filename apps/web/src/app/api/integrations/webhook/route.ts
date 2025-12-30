import { NextRequest, NextResponse } from "next/server";
import type {
  NangoWebhookPayload,
  AuthWebhookPayload,
  SyncWebhookPayload,
} from "./handlers/types";
import { handleCreationWebhook } from "./handlers/creationHandler";
import { handleSyncWebhook } from "./handlers/syncHandler";
import { verifyNangoWebhookRequest } from "../utils/nangoConnection";

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const payload: NangoWebhookPayload = JSON.parse(body);
    console.log("Webhook payload received:", {
      type: payload.type,
      operation: payload.operation,
      connectionId: payload.connectionId,
      providerConfigKey: payload.providerConfigKey,
    });

    // Convert headers to plain object for verification
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify the webhook request signature
    const isValid = verifyNangoWebhookRequest(body, headers);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Route webhooks based on type and operation
    if (payload.type === "auth" && payload.operation === "creation") {
      // Handle auth creation webhooks
      return await handleCreationWebhook(payload as AuthWebhookPayload);
    } else if (payload.type === "sync") {
      // Handle sync webhooks
      return await handleSyncWebhook(payload as SyncWebhookPayload);
    } else {
      // Ignore other webhook types for now (can be extended later)
      console.log(
        `Webhook type "${payload.type}" with operation "${payload.operation}" ignored`
      );
      return NextResponse.json(
        { message: "Webhook type not handled" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing Nango webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
