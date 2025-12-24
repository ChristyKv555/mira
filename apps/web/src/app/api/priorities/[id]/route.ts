import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { taskPriorities } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

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

    // Prepare update data
    const updateData: Partial<typeof taskPriorities.$inferInsert> = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.key !== undefined) updateData.key = body.key;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.color !== undefined) updateData.color = body.color;

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

