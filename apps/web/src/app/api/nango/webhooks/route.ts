import { NextRequest, NextResponse } from "next/server";
import {
  handleAuthWebhook,
  handleSyncWebhook,
  handleForwardedWebhook,
} from "@/app/api/nango/handlers";
import type { NangoWebhookPayload } from "@/app/api/nango/helpers";

/**
 * Main webhook handler for Nango events
 * Routes different webhook types to appropriate handlers
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NangoWebhookPayload;

    // Verify webhook signature (optional but recommended)
    // TODO: Add signature verification using Nango's webhook secret
    // const signature = request.headers.get("x-nango-signature");
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const { type } = body;

    // Route based on webhook type and operation
    switch (type) {
      case "auth":
        return handleAuthWebhook(request, body);

      case "sync":
        return handleSyncWebhook(request, body);

      case "forwarded":
        return handleForwardedWebhook(request, body);

      default:
        console.warn("Unknown webhook type received:", type);
        return NextResponse.json(
          { success: true, message: "Webhook type not handled, ignoring" },
          { status: 200 }
        );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
