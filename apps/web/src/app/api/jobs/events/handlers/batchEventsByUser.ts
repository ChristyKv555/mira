import type { SourceEvent } from "@/database/schema/sourceEvents";

/**
 * Groups source events by userId and then by platform/integrationId
 * @param events Array of source events to batch
 * @returns Map structure: userId -> platform/integrationId -> events[]
 */
export function batchEventsByUser(
  events: SourceEvent[]
): Map<string, Map<string, SourceEvent[]>> {
  const userBatches = new Map<string, Map<string, SourceEvent[]>>();

  for (const event of events) {
    const userId = event.userId;

    // Get or create user batch
    if (!userBatches.has(userId)) {
      userBatches.set(userId, new Map());
    }
    const userBatch = userBatches.get(userId)!;

    // Use integrationId if available, otherwise use platform as grouping key
    const groupKey = event.integrationId || event.platform;

    // Get or create platform/integration batch
    if (!userBatch.has(groupKey)) {
      userBatch.set(groupKey, []);
    }
    userBatch.get(groupKey)!.push(event);
  }

  return userBatches;
}
