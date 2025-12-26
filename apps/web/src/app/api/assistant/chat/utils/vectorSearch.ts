import { db } from "@/database";
import { sql } from "drizzle-orm";
import type { Task } from "@/database/schema/tasks";

const SIMILARITY_THRESHOLD = 0.7; // Cosine similarity threshold (0-1, higher = more similar)
const MAX_RESULTS = 10; // Maximum number of similar tasks to return

// Type for raw database row result from SQL query
interface RawTaskRow {
  id: string;
  user_id: string;
  source_platform: string | null;
  source_external_id: string | null;
  source_event_id: string | null;
  status_id: string | null;
  priority_id: string | null;
  title: string;
  description: string | null;
  embedding: number[] | null;
  due_date: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  similarity: string | number;
}

/**
 * Performs vector similarity search on tasks using cosine distance
 * @param queryEmbedding - The embedding vector of the user query
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
    // Use pgvector's cosine distance function
    // 1 - cosine_distance gives us cosine similarity (0-1, higher is more similar)
    // Format embedding as PostgreSQL array string for vector casting
    const embeddingArray = `[${queryEmbedding.join(",")}]`;

    // Use raw SQL for pgvector operations
    // Note: Using sql.raw for the vector array as drizzle doesn't support vector type directly
    const result = await db.execute(
      sql.raw(`
        SELECT
          id,
          user_id,
          source_platform,
          source_external_id,
          source_event_id,
          status_id,
          priority_id,
          title,
          description,
          embedding,
          due_date,
          completed_at,
          created_at,
          updated_at,
          1 - (embedding <=> ${embeddingArray}::vector) as similarity
        FROM tasks
        WHERE user_id = '${userId}'
          AND embedding IS NOT NULL
          AND 1 - (embedding <=> ${embeddingArray}::vector) >= ${SIMILARITY_THRESHOLD}
        ORDER BY embedding <=> ${embeddingArray}::vector
        LIMIT ${MAX_RESULTS}
      `)
    );

    // Map results to Task type
    const rows = result as unknown as RawTaskRow[];
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      sourcePlatform: row.source_platform,
      sourceExternalId: row.source_external_id,
      sourceEventId: row.source_event_id,
      statusId: row.status_id,
      priorityId: row.priority_id,
      title: row.title,
      description: row.description,
      embedding: row.embedding,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      similarity:
        typeof row.similarity === "string"
          ? parseFloat(row.similarity)
          : row.similarity,
    })) as Array<Task & { similarity: number }>;
  } catch (error) {
    console.error("Error in vector similarity search:", error);
    return [];
  }
}
