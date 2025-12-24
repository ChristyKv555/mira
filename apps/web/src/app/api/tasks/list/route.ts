import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import {
  tasks,
  taskStatuses,
  taskPriorities,
  sourceEvents,
} from "@/database/schema";
import { eq } from "drizzle-orm";
import { extractUserDataOrThrow } from "@/app/api/utils/extractor";

export async function GET(request: NextRequest) {
  try {
    const userData = extractUserDataOrThrow(request);

    // Fetch tasks with joined status, priority, and source data
    const userTasks = await db
      .select({
        // Task fields
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
        // Status fields
        status: {
          id: taskStatuses.id,
          userId: taskStatuses.userId,
          label: taskStatuses.label,
          key: taskStatuses.key,
          color: taskStatuses.color,
          order: taskStatuses.order,
          createdAt: taskStatuses.createdAt,
        },
        // Priority fields
        priority: {
          id: taskPriorities.id,
          userId: taskPriorities.userId,
          label: taskPriorities.label,
          key: taskPriorities.key,
          level: taskPriorities.level,
          color: taskPriorities.color,
          createdAt: taskPriorities.createdAt,
        },
        // Source fields
        sourcePlatform: sourceEvents.platform,
        sourceExternalId: sourceEvents.externalId,
      })
      .from(tasks)
      .leftJoin(taskStatuses, eq(tasks.statusId, taskStatuses.id))
      .leftJoin(taskPriorities, eq(tasks.priorityId, taskPriorities.id))
      .leftJoin(sourceEvents, eq(tasks.sourceEventId, sourceEvents.id))
      .where(eq(tasks.userId, userData.userId))
      .orderBy(tasks.createdAt);

    // Transform the data to match the frontend Task type
    const formattedTasks = userTasks.map((task) => ({
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
      status: task.status?.id
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
      priority: task.priority?.id
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
    }));

    return NextResponse.json({
      tasks: formattedTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
