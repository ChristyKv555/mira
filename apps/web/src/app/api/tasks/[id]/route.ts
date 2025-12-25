import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import {
  tasks,
  taskStatuses,
  taskPriorities,
  sourceEvents,
  updateTaskSchema,
} from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { ZodError } from "zod";
import { generateEmbedding } from "@/lib/genai/embedding";
import { createTaskContentForEmbedding } from "../utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = extractUserDataOrThrow(request);
    const { id: taskId } = await params;
    const body = await request.json();

    // Verify task belongs to user
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userData.userId)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate input using Zod schema (omit id and userId as they come from params/userData)
    const validatedData = updateTaskSchema
      .omit({ id: true, userId: true })
      .parse(body);

    const currentTask = existingTask[0];

    // Check if title or description changed
    const titleChanged =
      validatedData.title !== undefined &&
      validatedData.title !== currentTask.title;
    const descriptionChanged =
      validatedData.description !== undefined &&
      validatedData.description !== currentTask.description;
    const shouldRegenerateEmbedding = titleChanged || descriptionChanged;

    // Prepare update data (validatedData already excludes id and userId)
    const updateData: Record<string, unknown> = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Generate and include embedding only if title or description changed
    if (shouldRegenerateEmbedding) {
      const newTitle = validatedData.title ?? currentTask.title;
      const newDescription =
        validatedData.description ?? currentTask.description;
      const taskContent = createTaskContentForEmbedding(
        newTitle,
        newDescription
      );
      const embedding = await generateEmbedding(taskContent);
      updateData.embedding = embedding;
    }

    // Update task
    await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userData.userId)));

    // Fetch updated task with joined data
    const updatedTask = await db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        sourceEventId: tasks.sourceEventId,
        statusId: tasks.statusId,
        priorityId: tasks.priorityId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        status: taskStatuses,
        priority: taskPriorities,
        sourcePlatform: sourceEvents.platform,
        sourceExternalId: sourceEvents.externalId,
      })
      .from(tasks)
      .leftJoin(taskStatuses, eq(tasks.statusId, taskStatuses.id))
      .leftJoin(taskPriorities, eq(tasks.priorityId, taskPriorities.id))
      .leftJoin(sourceEvents, eq(tasks.sourceEventId, sourceEvents.id))
      .where(eq(tasks.id, taskId))
      .limit(1);

    const task = updatedTask[0];

    return NextResponse.json({
      task: {
        id: task.id,
        userId: task.userId,
        sourceEventId: task.sourceEventId,
        statusId: task.statusId,
        priorityId: task.priorityId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString() || null,
        completedAt: task.completedAt?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        status: task.status
          ? {
              id: task.status.id,
              userId: task.status.userId,
              label: task.status.label,
              key: task.status.key,
              color: task.status.color,
              order: task.status.order,
              createdAt: task.status.createdAt.toISOString(),
            }
          : undefined,
        priority: task.priority
          ? {
              id: task.priority.id,
              userId: task.priority.userId,
              label: task.priority.label,
              key: task.priority.key,
              level: task.priority.level,
              color: task.priority.color,
              createdAt: task.priority.createdAt.toISOString(),
            }
          : undefined,
        source:
          task.sourcePlatform && task.sourceExternalId
            ? {
                platform: task.sourcePlatform,
                externalId: task.sourceExternalId,
              }
            : null,
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update task" },
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
    const { id: taskId } = await params;

    // Verify task belongs to user and delete
    const deletedTask = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userData.userId)))
      .returning();

    if (deletedTask.length === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
