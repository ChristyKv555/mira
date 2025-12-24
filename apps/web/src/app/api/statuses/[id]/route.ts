import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { taskStatuses } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: statusId } = await params;
    const body = await request.json();

    // Verify status belongs to user
    const existingStatus = await db
      .select()
      .from(taskStatuses)
      .where(
        and(
          eq(taskStatuses.id, statusId),
          eq(taskStatuses.userId, userData.userId)
        )
      )
      .limit(1);

    if (existingStatus.length === 0) {
      return NextResponse.json(
        { error: "Status not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate and prepare update data
    const updateData: Partial<typeof taskStatuses.$inferInsert> = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.key !== undefined) updateData.key = body.key;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.order !== undefined) updateData.order = body.order;

    // Update status
    const [updatedStatus] = await db
      .update(taskStatuses)
      .set(updateData)
      .where(
        and(
          eq(taskStatuses.id, statusId),
          eq(taskStatuses.userId, userData.userId)
        )
      )
      .returning();

    return NextResponse.json({
      status: {
        ...updatedStatus,
        createdAt: updatedStatus.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
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
    const { id: statusId } = await params;

    // Verify status belongs to user and delete
    const deletedStatus = await db
      .delete(taskStatuses)
      .where(
        and(
          eq(taskStatuses.id, statusId),
          eq(taskStatuses.userId, userData.userId)
        )
      )
      .returning();

    if (deletedStatus.length === 0) {
      return NextResponse.json(
        { error: "Status not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting status:", error);
    return NextResponse.json(
      { error: "Failed to delete status" },
      { status: 500 }
    );
  }
}
