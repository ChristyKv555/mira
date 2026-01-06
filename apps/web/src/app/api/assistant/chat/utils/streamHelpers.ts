const encoder = new TextEncoder();

export const FRIENDLY_ERROR_MESSAGE =
  "I encountered some technical difficulties while processing your request. Please try again later or contact support if the issue persists.";

/**
 * Creates an SSE event message
 */
export function createSSEMessage(data: string): Uint8Array {
  return encoder.encode(`data: ${data}\n\n`);
}

/**
 * Creates a JSON SSE event message
 */
export function createJSONSSEMessage(obj: Record<string, unknown>): Uint8Array {
  return createSSEMessage(JSON.stringify(obj));
}

/**
 * Creates a plain text SSE event message (for streaming chunks)
 */
export function createTextSSEMessage(text: string): Uint8Array {
  return createSSEMessage(text);
}

/**
 * Creates an error SSE event message
 */
export function createErrorSSEMessage(error: string): Uint8Array {
  return createJSONSSEMessage({ type: "error", error });
}

/**
 * Creates a metadata SSE event message
 */
export function createMetadataSSEMessage(
  data: Record<string, unknown>
): Uint8Array {
  return createJSONSSEMessage({ type: "metadata", data });
}

/**
 * Creates a completion SSE event message
 */
export function createCompletionSSEMessage(
  data: Record<string, unknown>
): Uint8Array {
  return createJSONSSEMessage({ type: "complete", data });
}

/**
 * Streams a friendly error message to the client
 * This sends the error as a text message (so it appears in chat) followed by an error event
 * @param controller - The ReadableStreamDefaultController to enqueue messages
 * @param error - The original error (for logging)
 */
export function streamFriendlyError(
  controller: ReadableStreamDefaultController<Uint8Array>,
  error: unknown
): void {
  // Log the actual error for debugging
  console.error("Error in streaming chat:", error);

  // Send friendly error message as text (appears in chat)
  controller.enqueue(createTextSSEMessage(FRIENDLY_ERROR_MESSAGE));

  // Send error event for client-side handling
  const errorMessage =
    error instanceof Error ? error.message : "Failed to stream chat response";
  controller.enqueue(createErrorSSEMessage(errorMessage));

  // Close the stream
  controller.close();
}
