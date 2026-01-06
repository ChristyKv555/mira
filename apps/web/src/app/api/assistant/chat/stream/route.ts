import { NextRequest } from "next/server";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { makeAICall } from "@/lib/genai/model";
import { z } from "zod";
import {
  getOrCreateSession,
  getConversationHistory,
  saveUserMessage,
  saveAssistantMessage,
  updateSessionTimestamp,
} from "../utils/sessionManagement";
import { findSimilarTasksWithContext } from "../utils/vectorSearch";
import { buildSystemPrompt } from "../utils/prompts";
import {
  createMetadataSSEMessage,
  createTextSSEMessage,
  createCompletionSSEMessage,
  streamFriendlyError,
} from "../utils/streamHelpers";
import { generateEmbedding } from "@/lib/genai";

const sendMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.uuid().optional(),
  type: z.enum(["ask", "generate"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();

    const validatedData = sendMessageSchema.parse(body);
    const { message, sessionId, type } = validatedData;

    // Get or create chat session
    const session = await getOrCreateSession(
      userData.userId,
      sessionId,
      type,
      message
    );

    // Get conversation history for context
    const conversationHistory = await getConversationHistory(session.id);

    // Save user message
    const userMessage = await saveUserMessage(
      session.id,
      userData.userId,
      message
    );

    // Create a ReadableStream for SSE
    let accumulatedContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          controller.enqueue(
            createMetadataSSEMessage({
              sessionId: session.id,
              userMessageId: userMessage.id,
            })
          );

          const queryEmbedding = await generateEmbedding(message);

          // Step 1: Get all tasks for the user with joined data
          const similarTasks = await findSimilarTasksWithContext(
            userData.userId,
            queryEmbedding
          );

          // Step 3: Build system prompt with context
          const systemPrompt = buildSystemPrompt(similarTasks);

          // Step 4: Get streaming AI response with context
          const aiResponse = await makeAICall({
            prompt: message,
            conversationHistory: conversationHistory,
            systemMessage: systemPrompt,
            stream: true,
            modelParams: {
              model: "gemini-2.5-flash",
              temperature: 0.7,
              maxTokens: 1000,
            },
          });

          // Check if it's a stream
          if (
            aiResponse &&
            typeof aiResponse === "object" &&
            Symbol.asyncIterator in aiResponse
          ) {
            // Stream the response chunks as plain text (SSE format)
            for await (const chunk of aiResponse) {
              accumulatedContent += chunk;
              // Send each chunk as plain text in SSE format
              controller.enqueue(createTextSSEMessage(chunk));
            }

            // Save complete AI response to database
            const assistantMessage = await saveAssistantMessage(
              session.id,
              userData.userId,
              accumulatedContent
            );

            // Update session updatedAt
            await updateSessionTimestamp(session.id);

            // Send completion event
            controller.enqueue(
              createCompletionSSEMessage({
                assistantMessageId: assistantMessage.id,
                content: accumulatedContent,
              })
            );
          } else {
            throw new Error("Expected streaming response but got non-stream");
          }

          // Close the stream
          controller.close();
        } catch (error) {
          // Use friendly error utility to send user-friendly message
          streamFriendlyError(controller, error);
        }
      },
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering for nginx
      },
    });
  } catch (error) {
    console.error("Error in chat stream route:", error);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: error.issues }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle session management errors
    if (error instanceof Error && error.message.includes("session")) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes("not found") ? 404 : 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Failed to process chat message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
