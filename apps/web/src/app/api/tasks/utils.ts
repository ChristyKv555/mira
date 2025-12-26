interface TaskDataForEmbedding {
  title: string;
  description?: string | null;
  status?: { label: string } | null;
  priority?: { label: string } | null;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  sourcePlatform?: string | null;
}

export function createTaskContentForEmbedding(
  task: TaskDataForEmbedding
): string {
  const parts: string[] = [];

  // Title - always present
  if (task.title) {
    parts.push(`This is the task title - ${task.title}`);
  }

  // Description
  if (task.description) {
    parts.push(`This is the task description - ${task.description}`);
  }

  // Status
  if (task.status?.label) {
    parts.push(`This is the task status - ${task.status.label}`);
  }

  // Priority
  if (task.priority?.label) {
    parts.push(`This is the task priority - ${task.priority.label}`);
  }

  // Due date
  if (task.dueDate) {
    const dueDateStr =
      task.dueDate instanceof Date
        ? task.dueDate.toISOString().split("T")[0]
        : new Date(task.dueDate).toISOString().split("T")[0];
    parts.push(`This is the task due date - ${dueDateStr}`);
  }

  // Completed date
  if (task.completedAt) {
    const completedStr =
      task.completedAt instanceof Date
        ? task.completedAt.toISOString().split("T")[0]
        : new Date(task.completedAt).toISOString().split("T")[0];
    parts.push(`This is the task completed at - ${completedStr}`);
  }

  // Created date
  if (task.createdAt) {
    const createdStr =
      task.createdAt instanceof Date
        ? task.createdAt.toISOString().split("T")[0]
        : new Date(task.createdAt).toISOString().split("T")[0];
    parts.push(`This is the task created at - ${createdStr}`);
  }

  // Updated date
  if (task.updatedAt) {
    const updatedStr =
      task.updatedAt instanceof Date
        ? task.updatedAt.toISOString().split("T")[0]
        : new Date(task.updatedAt).toISOString().split("T")[0];
    parts.push(`This is the task updated at - ${updatedStr}`);
  }

  // Source platform
  if (task.sourcePlatform) {
    parts.push(`This is the task source platform - ${task.sourcePlatform}`);
  }

  return parts.join("\n");
}
