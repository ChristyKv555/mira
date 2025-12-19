// Validation helpers using Zod schemas

import { insertUserSchema, updateUserSchema, selectUserSchema } from "./users";
import { insertTaskSchema, updateTaskSchema, selectTaskSchema } from "./tasks";
import {
  insertStatusSchema,
  updateStatusSchema,
  selectStatusSchema,
} from "./taskStatuses";
import {
  insertPrioritySchema,
  updatePrioritySchema,
  selectPrioritySchema,
} from "./taskPriorities";
import {
  insertIntegrationSchema,
  updateIntegrationSchema,
  selectIntegrationSchema,
} from "./integrations";
import {
  insertSourceEventSchema,
  updateSourceEventSchema,
  selectSourceEventSchema,
} from "./sourceEvents";

// User validation helpers
export function validateInsertUser(data: unknown) {
  return insertUserSchema.parse(data);
}

export function validateUpdateUser(data: unknown) {
  return updateUserSchema.parse(data);
}

export function validateSelectUser(data: unknown) {
  return selectUserSchema.parse(data);
}

// Task validation helpers
export function validateInsertTask(data: unknown) {
  return insertTaskSchema.parse(data);
}

export function validateUpdateTask(data: unknown) {
  return updateTaskSchema.parse(data);
}

export function validateSelectTask(data: unknown) {
  return selectTaskSchema.parse(data);
}

// Task Status validation helpers
export function validateInsertStatus(data: unknown) {
  return insertStatusSchema.parse(data);
}

export function validateUpdateStatus(data: unknown) {
  return updateStatusSchema.parse(data);
}

export function validateSelectStatus(data: unknown) {
  return selectStatusSchema.parse(data);
}

// Task Priority validation helpers
export function validateInsertPriority(data: unknown) {
  return insertPrioritySchema.parse(data);
}

export function validateUpdatePriority(data: unknown) {
  return updatePrioritySchema.parse(data);
}

export function validateSelectPriority(data: unknown) {
  return selectPrioritySchema.parse(data);
}

// Integration validation helpers
export function validateInsertIntegration(data: unknown) {
  return insertIntegrationSchema.parse(data);
}

export function validateUpdateIntegration(data: unknown) {
  return updateIntegrationSchema.parse(data);
}

export function validateSelectIntegration(data: unknown) {
  return selectIntegrationSchema.parse(data);
}

// Source Event validation helpers
export function validateInsertSourceEvent(data: unknown) {
  return insertSourceEventSchema.parse(data);
}

export function validateUpdateSourceEvent(data: unknown) {
  return updateSourceEventSchema.parse(data);
}

export function validateSelectSourceEvent(data: unknown) {
  return selectSourceEventSchema.parse(data);
}

// Safe parse helpers (returns success/error instead of throwing)
export function safeValidateInsertUser(data: unknown) {
  return insertUserSchema.safeParse(data);
}

export function safeValidateInsertTask(data: unknown) {
  return insertTaskSchema.safeParse(data);
}

export function safeValidateUpdateTask(data: unknown) {
  return updateTaskSchema.safeParse(data);
}

export function safeValidateInsertStatus(data: unknown) {
  return insertStatusSchema.safeParse(data);
}

export function safeValidateInsertPriority(data: unknown) {
  return insertPrioritySchema.safeParse(data);
}

export function safeValidateInsertIntegration(data: unknown) {
  return insertIntegrationSchema.safeParse(data);
}

export function safeValidateInsertSourceEvent(data: unknown) {
  return insertSourceEventSchema.safeParse(data);
}
