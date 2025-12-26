import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { chatSessions, chatMessages } from "@/database/schema";
import { eq, and, asc } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: sessionId } = await params;

    // Get session with messages
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

    // Get all messages for this session
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatSessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({
      session: {
        id: session[0].id,
        title: session[0].title,
        type: session[0].type,
        createdAt: session[0].createdAt.toISOString(),
        updatedAt: session[0].updatedAt.toISOString(),
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: sessionId } = await params;

    // Verify session belongs to user before deleting
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

    // Delete session (messages will cascade delete)
    await db
      .delete(chatSessions)
      .where(
        and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userData.userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: sessionId } = await params;
    const body = await request.json();

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

    // Update session (only title for now)
    const updateData: { title?: string | null; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    const [updatedSession] = await db
      .update(chatSessions)
      .set(updateData)
      .where(
        and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, userData.userId)
        )
      )
      .returning();

    return NextResponse.json({
      session: {
        id: updatedSession.id,
        title: updatedSession.title,
        type: updatedSession.type,
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating chat session:", error);
    return NextResponse.json(
      { error: "Failed to update chat session" },
      { status: 500 }
    );
  }
}

