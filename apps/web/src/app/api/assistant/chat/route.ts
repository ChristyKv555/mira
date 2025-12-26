import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { chatSessions, chatMessages } from "@/database/schema";
import { eq, asc, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { makeAICall } from "@/lib/genai/model";
import { z } from "zod";

const sendMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.uuid().optional(), // Optional: if provided, use existing session
  type: z.enum(["ask", "generate"]).optional(), // Required only if creating new session
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
        return NextResponse.json(
          { error: "Chat session not found or unauthorized" },
          { status: 404 }
        );
      }
      session = existingSession[0];
    } else {
      // Create new session
      if (!type) {
        return NextResponse.json(
          { error: "Type is required when creating a new session" },
          { status: 400 }
        );
      }

      const [newSession] = await db
        .insert(chatSessions)
        .values({
          userId: userData.userId,
          type: type,
          title: message.substring(0, 50), // Use first 50 chars as title
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

    // Get AI response
    const aiResponse = await makeAICall({
      prompt: message,
      conversationHistory: conversationHistory,
      modelParams: {
        model: "gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
      },
    });

    if (typeof aiResponse === "object" && "content" in aiResponse) {
      // Save AI response
      const [assistantMessage] = await db
        .insert(chatMessages)
        .values({
          chatSessionId: session.id,
          userId: userData.userId,
          role: "assistant",
          content: aiResponse.content,
        })
        .returning();

      // Update session updatedAt
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, session.id));

      return NextResponse.json({
        session: {
          id: session.id,
          title: session.title,
          type: session.type,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        },
        userMessage: {
          id: userMessage.id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: userMessage.createdAt.toISOString(),
        },
        assistantMessage: {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt.toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        { error: "Streaming responses not yet supported in this endpoint" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in chat route:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
