import type { SimilarTaskWithContext } from "./vectorSearch";

/**
 * Builds a system prompt that instructs the AI to use context when available
 * and provide generic responses when no relevant context is found
 */
export function buildSystemPrompt(
  similarTasks: SimilarTaskWithContext[]
): string {
  const hasContext = similarTasks.length > 0;

  if (!hasContext) {
    return `You are a helpful AI assistant for a task management application.
The user is asking a question, but no relevant tasks were found in their database that match their query.

IMPORTANT: Do not make up or hallucinate information about tasks that don't exist.
Instead, provide a helpful generic response acknowledging that you don't have specific information
about their tasks related to this query, but offer to help them in other ways.

Be friendly, concise, and helpful.`;
  }

  // Format tasks for context
  const tasksContext = similarTasks
    .map((task, index) => {
      const parts = [
        `Task ${index + 1}:`,
        `Title: ${task.title}`,
        task.description ? `Description: ${task.description}` : null,
        task.status ? `Status: ${task.status}` : null,
        task.priority ? `Priority: ${task.priority}` : null,
        task.dueDate
          ? `Due Date: ${new Date(task.dueDate).toLocaleDateString()}`
          : null,
        task.completedAt
          ? `Completed At: ${new Date(task.completedAt).toLocaleDateString()}`
          : null,
        task.updatedAt
          ? `Last Updated: ${new Date(task.updatedAt).toLocaleDateString()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      return parts;
    })
    .join("\n\n");

  return `You are a helpful AI assistant for a task management application. 
The user is asking a question, and I've found ${similarTasks.length} relevant task(s) from their database that might help answer their query.

RELEVANT TASKS FROM USER'S DATABASE:
${tasksContext}

INSTRUCTIONS:
1. Use the provided task information to answer the user's question accurately.
2. Only reference tasks that are explicitly listed above - do not make up or hallucinate information about other tasks.
3. If the user's question cannot be answered using the provided context, acknowledge this and offer to help in other ways.
4. Be concise, helpful, and accurate.
5. If multiple tasks are relevant, you can reference them together.
6. Format your response naturally and conversationally.`;
}

/**
 * Formats tasks into a readable string for context
 */
export function formatTasksForContext(tasks: SimilarTaskWithContext[]): string {
  if (tasks.length === 0) {
    return "No relevant tasks found.";
  }

  return tasks
    .map((task, index) => {
      const parts = [
        `Task ${index + 1}: ${task.title}`,
        task.description ? `  Description: ${task.description}` : null,
        task.status ? `  Status: ${task.status}` : null,
        task.priority ? `  Priority: ${task.priority}` : null,
        task.dueDate
          ? `  Due Date: ${new Date(task.dueDate).toLocaleDateString()}`
          : null,
        task.completedAt
          ? `  Completed At: ${new Date(task.completedAt).toLocaleDateString()}`
          : null,
        task.updatedAt
          ? `  Last Updated: ${new Date(task.updatedAt).toLocaleDateString()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      return parts;
    })
    .join("\n\n");
}
