import { db } from "@/database";
import {
  priorityMappings,
  statusMappings,
  taskPriorities,
  taskStatuses,
} from "@/database/schema";
import { eq, and, asc } from "drizzle-orm";

export interface UserContext {
  priorityMappings: Array<{
    id: string;
    priorityId: string;
    keywords: string[];
    isActive: boolean;
  }>;
  statusMappings: Array<{
    id: string;
    statusId: string;
    keywords: string[];
    isActive: boolean;
  }>;
  priorities: Array<{
    id: string;
    label: string;
    key: string;
    level: number;
    color: string | null;
  }>;
  statuses: Array<{
    id: string;
    label: string;
    key: string;
    order: number;
    color: string | null;
  }>;
  defaultStatusId: string | null;
}

/**
 * Fetches all user context needed for task processing:
 * - Priority mappings with keywords
 * - Status mappings with keywords
 * - All task priorities
 * - All task statuses
 * - Default "to-do" status ID
 */
export async function fetchUserContext(userId: string): Promise<UserContext> {
  // Fetch priority mappings
  const priorityMappingsData = await db
    .select({
      id: priorityMappings.id,
      priorityId: priorityMappings.priorityId,
      keywords: priorityMappings.keywords,
      isActive: priorityMappings.isActive,
    })
    .from(priorityMappings)
    .where(
      and(
        eq(priorityMappings.userId, userId),
        eq(priorityMappings.isActive, true)
      )
    );

  // Fetch status mappings
  const statusMappingsData = await db
    .select({
      id: statusMappings.id,
      statusId: statusMappings.statusId,
      keywords: statusMappings.keywords,
      isActive: statusMappings.isActive,
    })
    .from(statusMappings)
    .where(
      and(eq(statusMappings.userId, userId), eq(statusMappings.isActive, true))
    );

  // Fetch all priorities
  const prioritiesData = await db
    .select({
      id: taskPriorities.id,
      label: taskPriorities.label,
      key: taskPriorities.key,
      level: taskPriorities.level,
      color: taskPriorities.color,
    })
    .from(taskPriorities)
    .where(eq(taskPriorities.userId, userId));

  // Fetch all statuses
  const statusesData = await db
    .select({
      id: taskStatuses.id,
      label: taskStatuses.label,
      key: taskStatuses.key,
      order: taskStatuses.order,
      color: taskStatuses.color,
    })
    .from(taskStatuses)
    .where(eq(taskStatuses.userId, userId))
    .orderBy(asc(taskStatuses.order));

  // Find default "to-do" status (lowest order or key="to-do")
  let defaultStatusId: string | null = null;
  const todoStatus = statusesData.find((s) => s.key === "to-do");
  if (todoStatus) {
    defaultStatusId = todoStatus.id;
  } else if (statusesData.length > 0) {
    // Use the first status (lowest order) as default
    defaultStatusId = statusesData[0].id;
  }

  return {
    priorityMappings: priorityMappingsData.map((mapping) => ({
      ...mapping,
      keywords: mapping.keywords ?? [],
    })),
    statusMappings: statusMappingsData.map((mapping) => ({
      ...mapping,
      keywords: mapping.keywords ?? [],
    })),
    priorities: prioritiesData,
    statuses: statusesData.map((status, index) => ({
      ...status,
      order: status.order ?? index,
    })),
    defaultStatusId,
  };
}
