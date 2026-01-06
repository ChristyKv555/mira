export interface Task {
  id: string;
  userId: string;
  sourceEventId?: string | null;
  statusId?: string | null;
  priorityId?: string | null;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined data
  status?: TaskStatus;
  priority?: TaskPriority;
  source?: {
    platform: string;
    externalId: string;
  } | null;
}

export interface TaskStatus {
  id: string;
  userId: string;
  label: string;
  key: string;
  color?: string | null;
  order: number;
  createdAt: string;
}

export interface TaskPriority {
  id: string;
  userId: string;
  label: string;
  key: string;
  level: number;
  color?: string | null;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  statusId?: string;
  priorityId?: string;
  dueDate?: string;
  sourceEventId?: string;
}

export interface CreateStatusInput {
  label: string;
  key: string;
  color?: string;
  order?: number;
}

export interface CreatePriorityInput {
  label: string;
  key: string;
  level?: number;
  color?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  statusId?: string;
  priorityId?: string;
  dueDate?: string;
}
