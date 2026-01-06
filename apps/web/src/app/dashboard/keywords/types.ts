export interface PriorityMapping {
  id: string;
  userId: string;
  priorityId: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatusMapping {
  id: string;
  userId: string;
  statusId: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePriorityMappingInput {
  priorityId: string;
  keywords?: string[];
  isActive?: boolean;
}

export interface CreateStatusMappingInput {
  statusId: string;
  keywords?: string[];
  isActive?: boolean;
}

export interface UpdatePriorityMappingInput {
  id: string;
  keywords?: string[];
  isActive?: boolean;
}

export interface UpdateStatusMappingInput {
  id: string;
  keywords?: string[];
  isActive?: boolean;
}

