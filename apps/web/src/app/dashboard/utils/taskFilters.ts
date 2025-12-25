import type { Task } from "../tasks/types";

/**
 * Check if a task is completed by checking completedAt date or status
 */
export function isTaskCompleted(task: Task): boolean {
  // Check if completedAt is set and valid
  if (task.completedAt) {
    const date = new Date(task.completedAt);
    if (!isNaN(date.getTime())) return true;
  }
  // Check if status indicates completion (case-insensitive check for common completion statuses)
  if (task.status?.label) {
    const statusLabel = task.status.label.toLowerCase();
    const statusKey = task.status.key?.toLowerCase() || "";
    const completionKeywords = [
      "completed",
      "done",
      "closed",
      "finished",
      "resolved",
    ];
    if (
      completionKeywords.some(
        (keyword) =>
          statusLabel.includes(keyword) || statusKey.includes(keyword)
      )
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today && !isTaskCompleted(task);
}

/**
 * Check if a task needs high attention (overdue or high priority)
 */
export function needsHighAttention(task: Task): boolean {
  const isOverdue = isTaskOverdue(task);
  const isHighPriority = task.priority?.level && task.priority.level >= 3;
  return isOverdue || isHighPriority || false;
}

/**
 * Filter tasks that need high attention
 */
export function getHighAttentionTasks(tasks: Task[]): Task[] {
  return tasks.filter(needsHighAttention);
}

/**
 * Get completed tasks count
 */
export function getCompletedTasksCount(tasks: Task[]): number {
  return tasks.filter(isTaskCompleted).length;
}

/**
 * Get pending tasks count
 */
export function getPendingTasksCount(tasks: Task[]): number {
  return tasks.length - getCompletedTasksCount(tasks);
}

/**
 * Get overdue tasks count
 */
export function getOverdueTasksCount(tasks: Task[]): number {
  return tasks.filter(isTaskOverdue).length;
}

/**
 * Calculate completion rate percentage
 */
export function getCompletionRate(tasks: Task[]): number {
  const totalTasks = tasks.length;
  if (totalTasks === 0) return 0;
  const completedTasks = getCompletedTasksCount(tasks);
  return Math.round((completedTasks / totalTasks) * 100);
}
