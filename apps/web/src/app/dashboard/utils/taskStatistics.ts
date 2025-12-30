import type { Task } from "../tasks/types";
import {
  groupTasksByStatus,
  groupTasksByPriority,
  groupTasksByDueDate,
} from "./taskGrouping";

export type ViewType = "status" | "priority" | "dueDate";

interface ViewDataItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Get statistics data for a specific view type
 */
export function getViewData(tasks: Task[], viewType: ViewType): ViewDataItem[] {
  const totalTasks = tasks.length;

  switch (viewType) {
    case "status": {
      const statusGroups = groupTasksByStatus(tasks);
      return Object.entries(statusGroups).map(([label, taskList]) => ({
        label,
        count: taskList.length,
        percentage: totalTasks > 0 ? (taskList.length / totalTasks) * 100 : 0,
        color: taskList[0]?.status?.color || "#94a3b8",
      }));
    }

    case "priority": {
      const priorityGroups = groupTasksByPriority(tasks);
      return Object.entries(priorityGroups).map(([label, taskList]) => ({
        label,
        count: taskList.length,
        percentage: totalTasks > 0 ? (taskList.length / totalTasks) * 100 : 0,
        color: taskList[0]?.priority?.color || "#94a3b8",
      }));
    }

    case "dueDate": {
      const { overdue, dueToday, dueThisWeek, noDueDate } =
        groupTasksByDueDate(tasks);
      return [
        {
          label: "Overdue",
          count: overdue.length,
          percentage: totalTasks > 0 ? (overdue.length / totalTasks) * 100 : 0,
          color: "#ef4444",
        },
        {
          label: "Due Today",
          count: dueToday.length,
          percentage: totalTasks > 0 ? (dueToday.length / totalTasks) * 100 : 0,
          color: "#f59e0b",
        },
        {
          label: "Due This Week",
          count: dueThisWeek.length,
          percentage:
            totalTasks > 0 ? (dueThisWeek.length / totalTasks) * 100 : 0,
          color: "#3b82f6",
        },
        {
          label: "No Due Date",
          count: noDueDate.length,
          percentage:
            totalTasks > 0 ? (noDueDate.length / totalTasks) * 100 : 0,
          color: "#94a3b8",
        },
      ];
    }
  }
}
