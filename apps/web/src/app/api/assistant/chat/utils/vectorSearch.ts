import { db } from "@/database";
import { tasks, taskPriorities, taskStatuses } from "@/database/schema";
import { eq, and, isNotNull, sql, cosineDistance, asc } from "drizzle-orm";

/**
 * Type representing a task with joined status/priority labels
 */
export type SimilarTaskWithContext = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: string | null;
  priority: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  similarity: number;
};

const SIMILARITY_THRESHOLD = 0.5;

export async function findSimilarTasksWithContext(
  userId: string,
  queryEmbedding: number[]
): Promise<SimilarTaskWithContext[]> {
  try {
    const distance = cosineDistance(tasks.embedding, queryEmbedding);
    // Calculate similarity as 1 - cosine_distance
    const similarity = sql<number>`1 - (${distance})`;

    const results = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        status: taskStatuses.label,
        priority: taskPriorities.label,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        similarity: similarity,
      })
      .from(tasks)
      .leftJoin(taskStatuses, eq(tasks.statusId, taskStatuses.id))
      .leftJoin(taskPriorities, eq(tasks.priorityId, taskPriorities.id))
      .where(
        and(
          eq(tasks.userId, userId),
          isNotNull(tasks.embedding),
          sql`${similarity} > ${SIMILARITY_THRESHOLD}`
        )
      )
      .orderBy(asc(distance))
      .limit(10);

    return results.map((result) => ({
      ...result,
      similarity: Number(result.similarity),
    }));
  } catch (error) {
    console.error("[Vector Search Error]:", error);
    return [];
  }
}
