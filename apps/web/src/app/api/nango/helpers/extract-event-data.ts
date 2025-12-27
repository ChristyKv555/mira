/**
 * Helper functions to extract structured data from synced records
 * Each platform has different record structures, so we normalize them here
 */

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}

interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ mimeType: string; body: { data?: string } }>;
  };
}

interface SlackMessage {
  ts: string;
  text: string;
  user: string;
  channel: string;
  thread_ts?: string;
}

/**
 * Extract calendar event details from a synced record
 */
export function extractCalendarEvent(record: any): CalendarEvent | null {
  try {
    // Google Calendar events are stored directly in the record
    if (record.summary && (record.start || record.start?.dateTime || record.start?.date)) {
      return {
        id: record.id,
        summary: record.summary,
        description: record.description,
        start: record.start,
        end: record.end,
        location: record.location,
        attendees: record.attendees,
      };
    }
    return null;
  } catch (error) {
    console.error("Error extracting calendar event:", error);
    return null;
  }
}

/**
 * Extract email details from a synced Gmail record
 */
export function extractEmailData(record: any): EmailMessage | null {
  try {
    // Gmail messages structure
    if (record.id && record.snippet) {
      return {
        id: record.id,
        threadId: record.threadId,
        snippet: record.snippet,
        payload: record.payload,
      };
    }
    return null;
  } catch (error) {
    console.error("Error extracting email data:", error);
    return null;
  }
}

/**
 * Extract Slack message details from a synced record
 */
export function extractSlackMessage(record: any): SlackMessage | null {
  try {
    // Slack messages structure
    if (record.ts && record.text) {
      return {
        ts: record.ts,
        text: record.text,
        user: record.user,
        channel: record.channel,
        thread_ts: record.thread_ts,
      };
    }
    return null;
  } catch (error) {
    console.error("Error extracting Slack message:", error);
    return null;
  }
}

/**
 * Extract platform-specific data based on platform type
 */
export function extractEventData(
  platform: "slack" | "google-calendar" | "google-mail",
  record: any
) {
  switch (platform) {
    case "google-calendar":
      return extractCalendarEvent(record);
    case "google-mail":
      return extractEmailData(record);
    case "slack":
      return extractSlackMessage(record);
    default:
      return null;
  }
}

