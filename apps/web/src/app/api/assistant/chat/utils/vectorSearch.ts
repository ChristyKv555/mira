import { db } from "@/database";
import { tasks, taskPriorities, taskStatuses } from "@/database/schema";
import { eq } from "drizzle-orm";

/**
 * Type representing a task with joined status/priority labels
 */
export type SimilarTaskWithContext = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: string | null; // Joined from taskStatuses.label
  priority: string | null; // Joined from taskPriorities.label
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function findSimilarTasksWithContext(
  userId: string
): Promise<SimilarTaskWithContext[]> {
  try {
    // Get all tasks for the user with joined status and priority data
    const results = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        status: taskStatuses.label, // Joined value
        priority: taskPriorities.label, // Joined value
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      // Joins to get descriptive text instead of IDs
      .leftJoin(taskStatuses, eq(tasks.statusId, taskStatuses.id))
      .leftJoin(taskPriorities, eq(tasks.priorityId, taskPriorities.id))
      .where(eq(tasks.userId, userId));

    // Return all tasks with joined data
    return results.map((result) => ({
      id: result.id,
      title: result.title,
      description: result.description,
      dueDate: result.dueDate,
      status: result.status,
      priority: result.priority,
      completedAt: result.completedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));
  } catch (error) {
    console.error("[Task Fetch Error]:", error);
    return [];
  }
}
