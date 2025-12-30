import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { chatSessions } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { insertChatSessionSchema } from "@/database/schema/chatSessions";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);

    // Get all chat sessions for the user, ordered by most recent
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userData.userId))
      .orderBy(desc(chatSessions.updatedAt));

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        title: session.title,
        type: session.type,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();

    const validatedData = insertChatSessionSchema.parse({
      ...body,
      userId: userData.userId,
    });

    const [newSession] = await db
      .insert(chatSessions)
      .values(validatedData)
      .returning();

    return NextResponse.json(
      {
        session: {
          id: newSession.id,
          title: newSession.title,
          type: newSession.type,
          createdAt: newSession.createdAt.toISOString(),
          updatedAt: newSession.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat session:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
