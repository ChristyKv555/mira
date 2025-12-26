import { NextRequest } from "next/server";
import { db } from "@/database";
import { chatSessions, chatMessages } from "@/database/schema";
import { eq, asc, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { makeAICall } from "@/lib/genai/model";
import { z } from "zod";

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
    let session;
    if (sessionId) {
      // Use existing session
      const existingSession = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.id, sessionId),
            eq(chatSessions.userId, userData.userId)
          )
        )
        .limit(1);

      if (existingSession.length === 0) {
        return new Response(
          JSON.stringify({ error: "Chat session not found or unauthorized" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      session = existingSession[0];
    } else {
      // Create new session
      if (!type) {
        return new Response(
          JSON.stringify({ error: "Type is required when creating a new session" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const [newSession] = await db
        .insert(chatSessions)
        .values({
          userId: userData.userId,
          type: type,
          title: message.substring(0, 50),
        })
        .returning();

      session = newSession;
    }

    // Get conversation history for context
    const previousMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatSessionId, session.id))
      .orderBy(asc(chatMessages.createdAt));

    // Build conversation history for AI
    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Save user message
    const [userMessage] = await db
      .insert(chatMessages)
      .values({
        chatSessionId: session.id,
        userId: userData.userId,
        role: "user",
        content: message,
      })
      .returning();

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    let accumulatedContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata as JSON
          const metadata = {
            sessionId: session.id,
            userMessageId: userMessage.id,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "metadata", data: metadata })}\n\n`)
          );

          // Get streaming AI response
          const aiResponse = await makeAICall({
            prompt: message,
            conversationHistory: conversationHistory,
            stream: true,
            modelParams: {
              model: "gemini-2.5-flash",
              temperature: 0.7,
              maxTokens: 1000,
            },
          });

          // Check if it's a stream
          if (aiResponse && typeof aiResponse === "object" && Symbol.asyncIterator in aiResponse) {
            // Stream the response chunks as plain text (SSE format)
            for await (const chunk of aiResponse) {
              accumulatedContent += chunk;
              // Send each chunk as plain text in SSE format
              // The fetchEventSource will receive this in event.data
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            }

            // Save complete AI response to database
            const [assistantMessage] = await db
              .insert(chatMessages)
              .values({
                chatSessionId: session.id,
                userId: userData.userId,
                role: "assistant",
                content: accumulatedContent,
              })
              .returning();

            // Update session updatedAt
            await db
              .update(chatSessions)
              .set({ updatedAt: new Date() })
              .where(eq(chatSessions.id, session.id));

            // Send completion event as JSON
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "complete",
                  data: {
                    assistantMessageId: assistantMessage.id,
                    content: accumulatedContent,
                  },
                })}\n\n`
              )
            );
          } else {
            throw new Error("Expected streaming response but got non-stream");
          }

          // Close the stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming chat:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to stream chat response";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
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
    return new Response(
      JSON.stringify({ error: "Failed to process chat message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

