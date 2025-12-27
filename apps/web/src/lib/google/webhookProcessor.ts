import { getCalendarClient, getGmailClient } from "./oauth";
import { GoogleApiClient } from "./apiClient";
import type { TokenMetadata } from "./tokenManager";

export interface PubSubMessage {
  message: {
    data: string; // Base64 encoded
    attributes?: Record<string, string>;
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
}

export interface CalendarNotification {
  type: "calendar";
  userId: string;
  resourceId: string;
  resourceUri: string;
  channelId: string;
  expiration?: string;
}

export interface GmailNotification {
  type: "gmail";
  userId: string;
  emailAddress: string;
  historyId: string;
  expiration?: string;
}

/**
 * Decode Pub/Sub message data
 */
function decodeMessageData(data: string): any {
  try {
    const decoded = Buffer.from(data, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding message data:", error);
    return null;
  }
}

/**
 * Process Calendar notification from Pub/Sub
 */
export async function processCalendarNotification(
  notification: CalendarNotification,
  tokenMetadata: TokenMetadata
): Promise<{
  eventId: string;
  summary: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  attendees?: string[];
}> {
  const apiClient = new GoogleApiClient(tokenMetadata);
  const calendar = await apiClient.getCalendarClient();

  // Fetch event details using the resource URI
  // The resource URI format is: https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}
  const resourceUri = notification.resourceUri;
  const match = resourceUri.match(/\/events\/([^\/]+)/);
  const eventId = match ? match[1] : "";

  if (!eventId) {
    throw new Error("Could not extract event ID from resource URI");
  }

  // Extract calendar ID from resource URI
  const calendarMatch = resourceUri.match(/\/calendars\/([^\/]+)\//);
  const calendarId = calendarMatch ? calendarMatch[1] : "primary";

  // Fetch event details
  const eventResponse = await calendar.events.get({
    calendarId,
    eventId,
  });

  const event = eventResponse.data;

  return {
    eventId: event.id || "",
    summary: event.summary || "",
    startTime: event.start?.dateTime || event.start?.date || undefined,
    endTime: event.end?.dateTime || event.end?.date || undefined,
    description: event.description || undefined,
    location: event.location || undefined,
    attendees:
      event.attendees?.map((a) => a.email || "").filter(Boolean) || [],
  };
}

/**
 * Process Gmail notification from Pub/Sub
 */
export async function processGmailNotification(
  notification: GmailNotification,
  tokenMetadata: TokenMetadata,
  historyId?: string
): Promise<{
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  body?: string;
  date?: string;
}> {
  const apiClient = new GoogleApiClient(tokenMetadata);
  const gmail = await apiClient.getGmailClient();

  // Use provided historyId or the one from notification
  const targetHistoryId = historyId || notification.historyId;

  // Fetch history to get list of messages
  const historyResponse = await gmail.users.history.list({
    userId: "me",
    startHistoryId: targetHistoryId,
    maxResults: 10,
  });

  if (!historyResponse.data.history || historyResponse.data.history.length === 0) {
    throw new Error("No messages found in history");
  }

  // Get the first message from the most recent history entry
  const historyEntry = historyResponse.data.history[0];
  const messageId =
    historyEntry.messagesAdded?.[0]?.message?.id ||
    historyEntry.messages?.[0]?.id;

  if (!messageId) {
    throw new Error("Could not find message ID in history");
  }

  // Fetch message details
  const messageResponse = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const message = messageResponse.data;
  const headers = message.payload?.headers || [];

  // Extract headers
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ||
    "";

  const subject = getHeader("Subject");
  const from = getHeader("From");
  const date = getHeader("Date");

  // Extract body (prefer text/plain, fallback to text/html)
  let body: string | undefined;
  if (message.payload?.body?.data) {
    body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
  } else if (message.payload?.parts) {
    const textPart = message.payload.parts.find(
      (p) => p.mimeType === "text/plain"
    );
    const htmlPart = message.payload.parts.find(
      (p) => p.mimeType === "text/html"
    );

    const part = textPart || htmlPart;
    if (part?.body?.data) {
      body = Buffer.from(part.body.data, "base64").toString("utf-8");
    }
  }

  return {
    messageId: message.id || "",
    threadId: message.threadId || "",
    subject,
    from,
    snippet: message.snippet || "",
    body,
    date,
  };
}

/**
 * Parse Pub/Sub message and determine notification type
 */
export function parsePubSubMessage(
  message: PubSubMessage
): CalendarNotification | GmailNotification | null {
  const decoded = decodeMessageData(message.message.data);

  if (!decoded) {
    return null;
  }

  // Check if it's a Calendar notification
  if (decoded.resourceId || decoded.resourceUri) {
    return {
      type: "calendar",
      userId: decoded.userId || "",
      resourceId: decoded.resourceId || "",
      resourceUri: decoded.resourceUri || "",
      channelId: decoded.channelId || "",
      expiration: decoded.expiration,
    };
  }

  // Check if it's a Gmail notification
  if (decoded.emailAddress || decoded.historyId) {
    return {
      type: "gmail",
      userId: decoded.userId || "",
      emailAddress: decoded.emailAddress || "",
      historyId: decoded.historyId || "",
      expiration: decoded.expiration,
    };
  }

  // Try to determine from attributes
  const attributes = message.message.attributes || {};
  if (attributes.resourceId) {
    return {
      type: "calendar",
      userId: attributes.userId || "",
      resourceId: attributes.resourceId,
      resourceUri: attributes.resourceUri || "",
      channelId: attributes.channelId || "",
      expiration: attributes.expiration,
    };
  }

  if (attributes.emailAddress || attributes.historyId) {
    return {
      type: "gmail",
      userId: attributes.userId || "",
      emailAddress: attributes.emailAddress || "",
      historyId: attributes.historyId || "",
      expiration: attributes.expiration,
    };
  }

  return null;
}

