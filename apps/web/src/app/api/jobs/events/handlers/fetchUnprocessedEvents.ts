import { db } from "@/database";
import { sourceEvents } from "@/database/schema";
import { isNull, asc } from "drizzle-orm";
import type { SourceEvent } from "@/database/schema/sourceEvents";

/**
 * Fetches all unprocessed source events from the database
 * @returns Array of source events where processed_at IS NULL, ordered by created_at
 */
export async function fetchUnprocessedEvents(): Promise<SourceEvent[]> {
  const events = await db
    .select()
    .from(sourceEvents)
    .where(isNull(sourceEvents.processedAt))
    .orderBy(asc(sourceEvents.createdAt));

  return events;
}

