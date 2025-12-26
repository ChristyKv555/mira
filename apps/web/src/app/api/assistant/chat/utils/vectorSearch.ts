import { db, tasks } from "@/database";
import type { Task } from "@/database/schema/tasks";
import { cosineDistance, sql, gt, desc, and, isNotNull, eq } from "drizzle-orm";

const SIMILARITY_THRESHOLD = 0.3; // Cosine similarity threshold (0-1, higher = more similar)
const MAX_RESULTS = 10; // Maximum number of similar tasks to return

/**
 * Performs vector similarity search on tasks using Drizzle ORM's cosineDistance function
 * @param queryEmbedding - The embedding vector of the user query (must be 1536 dimensions)
 * @param userId - The user ID to filter tasks
 * @returns Array of similar tasks with their similarity scores
 */
export async function findSimilarTasks(
  queryEmbedding: number[],
  userId: string
): Promise<Array<Task & { similarity: number }>> {
  if (queryEmbedding.length !== 1536) {
    throw new Error("Query embedding must have 1536 dimensions");
  }

  try {
    // Calculate similarity: 1 - cosineDistance gives us cosine similarity (0-1, higher is more similar)
    // Using Drizzle's cosineDistance function with sql template for the calculation
    const similarity = sql<number>`1 - (${cosineDistance(tasks.embedding, queryEmbedding)})`;

    // Log for debugging
    console.log(
      `[Vector Search] Query: Searching for tasks similar to user query`
    );
    console.log(`[Vector Search] User ID: ${userId}`);
    console.log(
      `[Vector Search] Similarity threshold: ${SIMILARITY_THRESHOLD}`
    );

    // Perform vector similarity search using Drizzle ORM
    const results = await db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        sourcePlatform: tasks.sourcePlatform,
        sourceExternalId: tasks.sourceExternalId,
        sourceEventId: tasks.sourceEventId,
        statusId: tasks.statusId,
        priorityId: tasks.priorityId,
        title: tasks.title,
        description: tasks.description,
        embedding: tasks.embedding,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        similarity,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNotNull(tasks.embedding),
          gt(similarity, SIMILARITY_THRESHOLD)
        )
      )
      .orderBy(desc(similarity))
      .limit(MAX_RESULTS);

    console.log(`[Vector Search] Found ${results.length} similar tasks`);

    if (results.length === 0) {
      console.log(
        `[Vector Search] No tasks found above similarity threshold ${SIMILARITY_THRESHOLD}`
      );
      // Check if user has any tasks with embeddings at all
      const allTasksCheck = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(and(eq(tasks.userId, userId), isNotNull(tasks.embedding)));

      const taskCount = Number(allTasksCheck[0]?.count || 0);
      console.log(
        `[Vector Search] Total tasks with embeddings for user: ${taskCount}`
      );
      return [];
    }

    // Log similarity scores for debugging
    results.forEach((task) => {
      const simScore = Number(task.similarity);
      console.log(
        `[Vector Search] Task "${task.title}" - Similarity: ${simScore.toFixed(3)}`
      );
    });

    console.log(`[Vector Search] Returning ${results.length} tasks`);

    // Map results to ensure similarity is a number
    return results.map((task) => ({
      ...task,
      similarity: Number(task.similarity),
    })) as Array<Task & { similarity: number }>;
  } catch (error) {
    console.error("[Vector Search] Error in vector similarity search:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("[Vector Search] Error message:", error.message);
      console.error("[Vector Search] Error stack:", error.stack);
    }
    return [];
  }
}
