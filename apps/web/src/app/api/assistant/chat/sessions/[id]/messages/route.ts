import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { chatSessions, chatMessages } from "@/database/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: sessionId } = await params;

    // Verify session belongs to user
    const session = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userData.userId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: "Chat session not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const order = searchParams.get("order") || "asc"; // asc or desc

    // Get messages for this session
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatSessionId, sessionId))
      .orderBy(
        order === "desc"
          ? desc(chatMessages.createdAt)
          : asc(chatMessages.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatSessionId, sessionId));

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
      pagination: {
        total: totalMessages.length,
        limit,
        offset,
        hasMore: offset + limit < totalMessages.length,
      },
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}
