import { db } from "@/database";
import { sourceEvents } from "@/database/schema";
import { inArray } from "drizzle-orm";

/**
 * Marks source events as processed by setting processed_at timestamp
 */
export async function markEventsProcessed(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) {
    return;
  }

  await db
    .update(sourceEvents)
    .set({ processedAt: new Date() })
    .where(inArray(sourceEvents.id, eventIds));
}
