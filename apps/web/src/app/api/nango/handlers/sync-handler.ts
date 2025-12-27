import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { db } from "@/database";
import { integrations, sourceEvents } from "@/database/schema";
import { eq } from "drizzle-orm";
import type { NangoWebhookPayload } from "../helpers/types";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

/**
 * Handles sync completion webhooks from Nango
 * Fetches synced records from Nango and stores them in the database
 */
export async function handleSyncWebhook(
  request: NextRequest,
  payload: NangoWebhookPayload
): Promise<NextResponse> {
  const {
    connectionId,
    providerConfigKey,
    model,
    syncType,
    responseResults,
    modifiedAfter,
  } = payload;

  if (!connectionId || !providerConfigKey || !model) {
    console.error("Missing required fields for sync webhook:", payload);
    return NextResponse.json(
      {
        error:
          "Missing required fields: connectionId, providerConfigKey, and model are required",
      },
      { status: 400 }
    );
  }

  console.log("Sync webhook received:", {
    connectionId,
    providerConfigKey,
    model,
    syncType,
    responseResults,
    modifiedAfter,
  });

  try {
    // 1. Find the integration in our database using connectionId
    const integration = await db
      .select()
      .from(integrations)
      .where(eq(integrations.connectionId, connectionId))
      .limit(1);

    if (integration.length === 0) {
      console.error("Integration not found for connectionId:", connectionId);
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const integrationRecord = integration[0];
    // Map Nango integration ID to our platform name
    // Note: sourceEvents uses "google-mail" but integrations might use "gmail"
    let platform: "slack" | "google-calendar" | "google-mail";
    const normalizedId = providerConfigKey.toLowerCase();
    if (normalizedId === "gmail") {
      platform = "google-mail";
    } else if (normalizedId === "google-calendar") {
      platform = "google-calendar";
    } else if (normalizedId === "slack") {
      platform = "slack";
    } else {
      // Fallback to integration's platform if mapping fails
      platform = integrationRecord.platform as
        | "slack"
        | "google-calendar"
        | "google-mail";
    }

    // 2. Fetch records from Nango using modifiedAfter for incremental sync
    // Use modifiedAfter from webhook payload, or fetch all records if it's INITIAL sync
    // Fetch records with pagination to get all changes
    const allRecords: Array<Record<string, unknown>> = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const recordsResponse = await nango.listRecords({
        providerConfigKey,
        connectionId,
        model,
        modifiedAfter: syncType === "INITIAL" ? undefined : modifiedAfter,
        filter: "added", // Only get newly added records (you can also use "updated" or "deleted")
        cursor,
        limit: 100, // Fetch in batches of 100
      });

      const records = recordsResponse.records || [];
      allRecords.push(...records);

      // Check if there are more records to fetch
      cursor = recordsResponse.next_cursor ?? undefined;
      hasMore = !!cursor && records.length > 0;

      console.log(
        `Fetched batch: ${records.length} records, hasMore: ${hasMore}`
      );
    }

    const records = allRecords;
    let lastCursor: string | undefined;

    console.log(
      `Fetched ${records.length} records for ${model} from ${providerConfigKey}`
    );

    // 3. Process and store each record
    const processedRecords = [];
    for (const record of records) {
      try {
        // Extract the record ID (varies by platform)
        const recordWithMetadata = record as Record<string, unknown> & {
          id?: string;
          _nango_metadata?: {
            cursor?: string;
            last_modified_at?: string;
          };
        };

        const recordId =
          recordWithMetadata.id ||
          recordWithMetadata._nango_metadata?.cursor ||
          String(Date.now());

        // Store the cursor from metadata for pagination
        if (recordWithMetadata._nango_metadata?.cursor) {
          lastCursor = recordWithMetadata._nango_metadata.cursor;
        }

        // Check if record already exists
        const existingEvent = await db
          .select()
          .from(sourceEvents)
          .where(eq(sourceEvents.externalId, recordId))
          .limit(1);

        if (existingEvent.length > 0) {
          console.log(`Record ${recordId} already exists, skipping`);
          continue;
        }

        // Prepare the record data
        // The record contains the full event/email/message data from the external API
        // For Google Calendar: record contains event details (summary, start, end, attendees, etc.)
        // For Gmail: record contains email details (id, snippet, payload, threadId, etc.)
        // For Slack: record contains message details (ts, text, user, channel, etc.)
        const rawContent = JSON.stringify(record);
        const metadata = JSON.stringify({
          model,
          syncType,
          modifiedAfter,
          nangoMetadata: recordWithMetadata._nango_metadata,
          // Store additional metadata for easy access
          recordId: recordWithMetadata.id,
          lastModified: recordWithMetadata._nango_metadata?.last_modified_at,
        });

        // Insert into sourceEvents table
        const [newEvent] = await db
          .insert(sourceEvents)
          .values({
            userId: integrationRecord.userId,
            integrationId: integrationRecord.id,
            platform: platform,
            externalId: recordId,
            rawContent,
            metadata,
          })
          .returning();

        processedRecords.push(newEvent);
        console.log(`Stored event: ${newEvent.id} for ${platform} - ${model}`);
      } catch (error) {
        console.error(`Error processing record:`, error);
        // Continue processing other records even if one fails
      }
    }

    // 4. Log sync completion
    console.log(`Sync completed: ${processedRecords.length} new events stored`);

    return NextResponse.json({
      success: true,
      message: "Sync webhook processed successfully",
      syncInfo: {
        connectionId,
        providerConfigKey,
        model,
        syncType,
        recordsFetched: records.length,
        recordsStored: processedRecords.length,
        responseResults,
        lastCursor,
      },
    });
  } catch (error) {
    console.error("Error processing sync webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process sync webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
