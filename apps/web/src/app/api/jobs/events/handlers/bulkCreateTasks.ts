import { db } from "@/database";
import { tasks } from "@/database/schema";
import { generateEmbeddings } from "@/lib/genai/embedding";
import { createTaskContentForEmbedding } from "@/app/api/tasks/utils";
import type { ValidatedTask } from "../ai/validateTasksWithAI";
import type { UserContext } from "./fetchUserContext";

export interface TaskToCreate {
  userId: string;
  sourceEventId: string;
  sourcePlatform: string;
  title: string;
  description?: string;
  statusId: string;
  priorityId?: string;
  dueDate?: Date | null;
  embedding: number[];
}

/**
 * Bulk creates tasks with embeddings in a transaction
 */
export async function bulkCreateTasks(
  validatedTasks: ValidatedTask[],
  userId: string,
  context: UserContext
): Promise<Array<typeof tasks.$inferSelect>> {
  if (validatedTasks.length === 0) {
    return [];
  }

  // Fetch status labels for embedding generation
  const statusMap = new Map(
    context.statuses.map((s) => [s.id, { label: s.label }])
  );

  // Fetch priority labels for embedding generation
  const priorityMap = new Map(
    context.priorities.map((p) => [p.id, { label: p.label }])
  );

  // Prepare tasks with content for embedding
  const tasksWithContent = validatedTasks.map((task) => {
    const status = task.statusId ? statusMap.get(task.statusId) : null;
    const priority = task.priorityId ? priorityMap.get(task.priorityId) : null;

    return {
      task,
      content: createTaskContentForEmbedding({
        title: task.title,
        description: task.description || null,
        status,
        priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        sourcePlatform: task.sourcePlatform,
      }),
    };
  });

  // Generate embeddings in batch
  const contents = tasksWithContent.map((tc) => tc.content);
  const embeddings = await generateEmbeddings(contents);

  // Prepare tasks for insertion
  const tasksToInsert: Array<typeof tasks.$inferInsert> = tasksWithContent.map(
    ({ task }, index) => {
      // Parse dueDate safely
      let dueDate: Date | null = null;
      if (task.dueDate) {
        try {
          const parsedDate = new Date(task.dueDate);
          if (!isNaN(parsedDate.getTime())) {
            dueDate = parsedDate;
          }
        } catch (error) {
          // Invalid date, leave as null
          console.warn(`Invalid dueDate for task: ${task.title}`, error);
        }
      }

      return {
        userId,
        sourceEventId: task.sourceEventId,
        sourcePlatform: task.sourcePlatform,
        title: task.title,
        description: task.description || null,
        statusId: task.statusId,
        priorityId: task.priorityId || null,
        dueDate,
        embedding: embeddings[index],
      };
    }
  );

  // Insert all tasks in a transaction
  const createdTasks = await db.insert(tasks).values(tasksToInsert).returning();

  return createdTasks;
}
