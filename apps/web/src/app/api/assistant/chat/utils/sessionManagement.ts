import { db } from "@/database";
import { chatSessions, chatMessages } from "@/database/schema";
import { eq, asc, and } from "drizzle-orm";

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  type: "ask" | "generate";
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatSessionId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

/**
 * Gets or creates a chat session
 */
export async function getOrCreateSession(
  userId: string,
  sessionId: string | undefined,
  type: "ask" | "generate" | undefined,
  initialMessage: string
): Promise<ChatSession> {
  if (sessionId) {
    // Use existing session
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(
        and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId))
      )
      .limit(1);

    if (existingSession.length === 0) {
      throw new Error("Chat session not found or unauthorized");
    }

    return existingSession[0] as ChatSession;
  }

  // Create new session
  if (!type) {
    throw new Error("Type is required when creating a new session");
  }

  const [newSession] = await db
    .insert(chatSessions)
    .values({
      userId: userId,
      type: type,
      title: initialMessage.substring(0, 50),
    })
    .returning();

  return newSession as ChatSession;
}

/**
 * Gets conversation history for a session
 */
export async function getConversationHistory(
  sessionId: string
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const previousMessages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.chatSessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));

  return previousMessages.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));
}

/**
 * Saves a user message to the database
 */
export async function saveUserMessage(
  sessionId: string,
  userId: string,
  content: string
): Promise<ChatMessage> {
  const [userMessage] = await db
    .insert(chatMessages)
    .values({
      chatSessionId: sessionId,
      userId: userId,
      role: "user",
      content: content,
    })
    .returning();

  return userMessage as ChatMessage;
}

/**
 * Saves an assistant message to the database
 */
export async function saveAssistantMessage(
  sessionId: string,
  userId: string,
  content: string
): Promise<ChatMessage> {
  const [assistantMessage] = await db
    .insert(chatMessages)
    .values({
      chatSessionId: sessionId,
      userId: userId,
      role: "assistant",
      content: content,
    })
    .returning();

  return assistantMessage as ChatMessage;
}

/**
 * Updates session's updatedAt timestamp
 */
export async function updateSessionTimestamp(sessionId: string): Promise<void> {
  await db
    .update(chatSessions)
    .set({ updatedAt: new Date() })
    .where(eq(chatSessions.id, sessionId));
}
