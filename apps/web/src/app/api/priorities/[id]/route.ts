import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { taskPriorities } from "@/database/schema";
import { updatePrioritySchema } from "@/database/schema/taskPriorities";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: priorityId } = await params;
    const body = await request.json();

    // Verify priority belongs to user
    const existingPriority = await db
      .select()
      .from(taskPriorities)
      .where(
        and(
          eq(taskPriorities.id, priorityId),
          eq(taskPriorities.userId, userData.userId)
        )
      )
      .limit(1);

    if (existingPriority.length === 0) {
      return NextResponse.json(
        { error: "Priority not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate input using Zod schema (omit id and userId as they come from params/userData)
    const validatedData = updatePrioritySchema
      .omit({ id: true, userId: true })
      .parse(body);

    // Prepare update data (validatedData already excludes id and userId)
    const updateData = validatedData;

    // Update priority
    const [updatedPriority] = await db
      .update(taskPriorities)
      .set(updateData)
      .where(
        and(
          eq(taskPriorities.id, priorityId),
          eq(taskPriorities.userId, userData.userId)
        )
      )
      .returning();

    return NextResponse.json({
      priority: {
        ...updatedPriority,
        createdAt: updatedPriority.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating priority:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update priority" },
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
    const { id: priorityId } = await params;

    // Verify priority belongs to user and delete
    const deletedPriority = await db
      .delete(taskPriorities)
      .where(
        and(
          eq(taskPriorities.id, priorityId),
          eq(taskPriorities.userId, userData.userId)
        )
      )
      .returning();

    if (deletedPriority.length === 0) {
      return NextResponse.json(
        { error: "Priority not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting priority:", error);
    return NextResponse.json(
      { error: "Failed to delete priority" },
      { status: 500 }
    );
  }
}
