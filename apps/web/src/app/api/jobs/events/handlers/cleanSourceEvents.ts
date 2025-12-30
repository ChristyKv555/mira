import type { SourceEvent } from "@/database/schema/sourceEvents";

export interface CleanedSourceEvent {
  id: string;
  platform: string;
  rawContent: string;
}

/**
 * Cleans source events to extract only platform and raw_content
 * Removes metadata, externalId, and other unnecessary fields
 */
export function cleanSourceEvents(
  events: SourceEvent[]
): CleanedSourceEvent[] {
  return events.map((event) => ({
    id: event.id,
    platform: event.platform,
    rawContent: event.rawContent,
  }));
}

