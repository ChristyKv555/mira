import type { Task } from "../tasks/types";
import { isTaskCompleted } from "./taskFilters";

/**
 * Group tasks by source platform
 */
export function groupTasksBySource(tasks: Task[]): {
  tasksBySource: Record<string, Task[]>;
  customTasks: Task[];
} {
  const tasksBySource: Record<string, Task[]> = {};
  const customTasks: Task[] = [];

  tasks.forEach((task) => {
    if (task.source) {
      const platform = task.source.platform;
      if (!tasksBySource[platform]) {
        tasksBySource[platform] = [];
      }
      tasksBySource[platform].push(task);
    } else {
      customTasks.push(task);
    }
  });

  return { tasksBySource, customTasks };
}

/**
 * Group tasks by status
 */
export function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    const statusKey = task.status?.label || "No Status";
    if (!grouped[statusKey]) {
      grouped[statusKey] = [];
    }
    grouped[statusKey].push(task);
  });
  return grouped;
}

/**
 * Group tasks by priority
 */
export function groupTasksByPriority(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    const priorityKey = task.priority?.label || "No Priority";
    if (!grouped[priorityKey]) {
      grouped[priorityKey] = [];
    }
    grouped[priorityKey].push(task);
  });
  return grouped;
}

/**
 * Group tasks by due date category
 */
export function groupTasksByDueDate(tasks: Task[]): {
  overdue: Task[];
  dueToday: Task[];
  dueThisWeek: Task[];
  noDueDate: Task[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const overdue: Task[] = [];
  const dueToday: Task[] = [];
  const dueThisWeek: Task[] = [];
  const noDueDate: Task[] = [];

  tasks.forEach((task) => {
    // Skip completed tasks
    if (isTaskCompleted(task)) return;

    if (!task.dueDate) {
      noDueDate.push(task);
      return;
    }

    const due = new Date(task.dueDate);
    if (due < today) {
      overdue.push(task);
    } else if (due.toDateString() === today.toDateString()) {
      dueToday.push(task);
    } else if (due > today && due <= weekEnd) {
      dueThisWeek.push(task);
    } else {
      noDueDate.push(task);
    }
  });

  return { overdue, dueToday, dueThisWeek, noDueDate };
}
