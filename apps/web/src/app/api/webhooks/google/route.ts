import { NextRequest, NextResponse } from "next/server";
import {
  parsePubSubMessage,
  processCalendarNotification,
  processGmailNotification,
  type PubSubMessage,
} from "@/lib/google/webhookProcessor";
import { db } from "@/database";
import { integrations } from "@/database/schema";
import { eq } from "drizzle-orm";
import type { TokenMetadata } from "@/lib/google/tokenManager";

/**
 * Verify webhook signature (basic implementation)
 * In production, implement proper signature verification using WEBHOOK_SECRET
 */
function verifyWebhookSignature(request: NextRequest): boolean {
  // TODO: Implement proper signature verification
  // Google Pub/Sub sends messages with specific headers
  // For now, we'll accept all requests (not recommended for production)
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("WEBHOOK_SECRET not set, skipping signature verification");
    return true; // Allow in development
  }

  // Implement signature verification logic here
  // Check request headers for Pub/Sub signature
  return true;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "ngrok-skip-browser-warning": "true",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Handle ngrok browser warning bypass
    // Check if this is a browser warning page request
    const userAgent = request.headers.get("user-agent") || "";
    const isBrowser =
      userAgent.includes("Mozilla") ||
      userAgent.includes("Chrome") ||
      userAgent.includes("Safari");

    // If it's a browser request to webhook endpoint, redirect or return early
    // (This shouldn't happen, but handles edge cases)
    if (
      isBrowser &&
      !request.headers.get("content-type")?.includes("application/json")
    ) {
      return NextResponse.json(
        { message: "Webhook endpoint - use POST with JSON body" },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
    }

    const body: PubSubMessage = await request.json();

    // Parse Pub/Sub message
    const notification = parsePubSubMessage(body);

    if (!notification) {
      console.error("Could not parse Pub/Sub notification:", body);
      return NextResponse.json(
        { error: "Invalid notification format" },
        { status: 400 }
      );
    }

    // Find the integration based on notification type and user
    const platform =
      notification.type === "calendar" ? "google-calendar" : "google-mail";

    // For Calendar, we need to find by resourceId or user email
    // For Gmail, we can find by emailAddress
    const userIdentifier =
      notification.type === "gmail"
        ? notification.emailAddress
        : notification.userId;

    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.platform, platform));

    // Find matching integration
    const integration = userIntegrations.find((int) => {
      const metadata = int.metadata as any;
      if (notification.type === "gmail") {
        return metadata?.userEmail === userIdentifier;
      } else {
        // For calendar, check if resourceId matches
        return (
          metadata?.watchResourceId === notification.resourceId ||
          metadata?.userEmail === userIdentifier
        );
      }
    });

    if (!integration || integration.isActive !== 1) {
      console.error("Integration not found or inactive:", {
        platform,
        userIdentifier,
      });
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const tokenMetadata = integration.metadata as TokenMetadata;

    // Process notification based on type
    let processedData;
    try {
      if (notification.type === "calendar") {
        processedData = await processCalendarNotification(
          notification,
          tokenMetadata
        );

        // Here you would send to your AI model for processing
        // Example:
        // const aiAnalysis = await analyzeWithAI({
        //   type: "calendar_event",
        //   data: processedData,
        // });
        // if (aiAnalysis.isImportant) {
        //   await createTaskFromEvent(processedData, integration.userId);
        // }

        console.log("Processed calendar notification:", processedData);
      } else {
        // Extract historyId from Pub/Sub message if available
        const decoded = JSON.parse(
          Buffer.from(body.message.data, "base64").toString("utf-8")
        );
        const historyId = decoded.historyId || notification.historyId;

        processedData = await processGmailNotification(
          notification,
          tokenMetadata,
          historyId
        );

        // Here you would send to your AI model for processing
        // Example:
        // const aiAnalysis = await analyzeWithAI({
        //   type: "email",
        //   data: processedData,
        // });
        // if (aiAnalysis.isImportant) {
        //   await createTaskFromEmail(processedData, integration.userId);
        // }

        console.log("Processed Gmail notification:", processedData);
      }
    } catch (error) {
      console.error("Error processing notification:", error);
      // Return 200 to acknowledge receipt even if processing fails
      // This prevents Pub/Sub from retrying
      return NextResponse.json({
        received: true,
        error: "Processing failed",
      });
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json(
      {
        received: true,
        processed: true,
        type: notification.type,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
  }
}
