import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { taskPriorities } from "@/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { insertPrioritySchema } from "@/database/schema/taskPriorities";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    console.log("userData", userData);

    // Fetch user's priorities
    const userPriorities = await db
      .select()
      .from(taskPriorities)
      .where(eq(taskPriorities.userId, userData.userId))
      .orderBy(taskPriorities.level);
    console.log("userPriorities", userPriorities);

    return NextResponse.json({
      priorities: userPriorities.map((priority) => ({
        ...priority,
        createdAt: priority.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching priorities:", error);
    return NextResponse.json(
      { error: "Failed to fetch priorities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();

    // Validate input
    const validatedData = insertPrioritySchema.parse({
      ...body,
      userId: userData.userId,
    });

    // Check if key already exists for this user
    const existingPriority = await db
      .select()
      .from(taskPriorities)
      .where(
        and(
          eq(taskPriorities.userId, userData.userId),
          eq(taskPriorities.key, validatedData.key)
        )
      )
      .limit(1);

    if (existingPriority.length > 0) {
      return NextResponse.json(
        { error: "Priority with this key already exists" },
        { status: 400 }
      );
    }

    // If level not provided, set to max level + 1
    let level = validatedData.level;
    if (level === undefined) {
      const maxLevelPriority = await db
        .select()
        .from(taskPriorities)
        .where(eq(taskPriorities.userId, userData.userId))
        .orderBy(desc(taskPriorities.level))
        .limit(1);

      level = maxLevelPriority.length > 0 ? maxLevelPriority[0].level + 1 : 0;
    }

    // Insert priority
    const [newPriority] = await db
      .insert(taskPriorities)
      .values({
        userId: userData.userId,
        label: validatedData.label,
        key: validatedData.key,
        level: level,
        color: validatedData.color || null,
      })
      .returning();

    return NextResponse.json({
      priority: {
        ...newPriority,
        createdAt: newPriority.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating priority:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create priority" },
      { status: 500 }
    );
  }
}
