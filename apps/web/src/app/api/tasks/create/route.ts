import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import {
  tasks,
  taskStatuses,
  taskPriorities,
  sourceEvents,
} from "@/database/schema";
import { eq, asc } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";
import { insertTaskSchema } from "@/database/schema/tasks";
import { generateEmbedding } from "@/lib/genai/embedding";
import { createTaskContentForEmbedding } from "../utils";

export async function POST(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);
    const body = await request.json();

    const validatedData = insertTaskSchema.parse({
      ...body,
      userId: userData.userId,
    });

    // If no statusId provided, get the first status (lowest order)
    let statusId = validatedData.statusId;
    let status = null;
    if (!statusId) {
      const firstStatus = await db
        .select()
        .from(taskStatuses)
        .where(eq(taskStatuses.userId, userData.userId))
        .orderBy(asc(taskStatuses.order))
        .limit(1);

      if (firstStatus.length > 0) {
        statusId = firstStatus[0].id;
        status = { label: firstStatus[0].label };
      } else {
        return NextResponse.json(
          { error: "No status columns found. Please create a status first." },
          { status: 400 }
        );
      }
    } else {
      // Fetch status label for embedding
      const statusResult = await db
        .select()
        .from(taskStatuses)
        .where(eq(taskStatuses.id, statusId))
        .limit(1);
      if (statusResult.length > 0) {
        status = { label: statusResult[0].label };
      }
    }

    // Fetch priority label if priorityId is provided
    let priority = null;
    if (validatedData.priorityId) {
      const priorityResult = await db
        .select()
        .from(taskPriorities)
        .where(eq(taskPriorities.id, validatedData.priorityId))
        .limit(1);
      if (priorityResult.length > 0) {
        priority = { label: priorityResult[0].label };
      }
    }

    // Generate embedding for task content
    const taskContent = createTaskContentForEmbedding({
      title: validatedData.title,
      description: validatedData.description || null,
      status,
      priority,
      dueDate: validatedData.dueDate || null,
    });
    const embedding = await generateEmbedding(taskContent);

    // Insert task with embedding
    const [newTask] = await db
      .insert(tasks)
      .values({
        userId: userData.userId,
        title: validatedData.title,
        description: validatedData.description || null,
        statusId: statusId || null,
        priorityId: validatedData.priorityId || null,
        sourceEventId: validatedData.sourceEventId || null,
        dueDate: validatedData.dueDate || null,
        embedding: embedding,
      })
      .returning();

    // Fetch the created task with joined data
    const fullTask = await db
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
      .where(eq(tasks.id, newTask.id))
      .limit(1);

    const task = fullTask[0];

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
    console.error("Error creating task:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
