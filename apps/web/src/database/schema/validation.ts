/**
 * Validation helpers using Zod schemas
 *
 * Example usage:
 *
 * import { validateInsertTask, validateUpdateTask } from "@/database/schema/validation";
 *
 * // Validate before inserting
 * const validatedData = validateInsertTask({
 *   userId: "123",
 *   title: "My task"
 * });
 *
 * // Use validatedData in your database operations
 * await db.insert(tasks).values(validatedData);
 */

import { insertUserSchema, updateUserSchema, selectUserSchema } from "./users";
import { insertTaskSchema, updateTaskSchema, selectTaskSchema } from "./tasks";

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
