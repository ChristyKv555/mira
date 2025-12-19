import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  priority: integer("priority").default(0), // 0 = low, 1 = medium, 2 = high
  source: text("source"), // e.g., "email", "slack", "jira", etc.
  sourceId: text("source_id"), // ID from the source system
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task status enum
export const taskStatusEnum = z.enum(["pending", "in_progress", "completed"]);

// Task priority enum
export const taskPriorityEnum = z.enum(["0", "1", "2"]);

// Zod schemas derived from Drizzle table
export const selectTaskSchema = createSelectSchema(tasks, {
  status: taskStatusEnum,
  priority: z.number().int().min(0).max(2),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  source: z.string().optional(),
  sourceId: z.string().optional(),
});

export const insertTaskSchema = createInsertSchema(tasks, {
  userId: z.uuid("Invalid user ID"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: taskStatusEnum.default("pending"),
  priority: z.number().int().min(0).max(2).default(0),
  source: z.string().optional(),
  sourceId: z.string().optional(),
  dueDate: z.date().optional(),
});

// Update schema (all fields optional except id)
export const updateTaskSchema = insertTaskSchema
  .partial()
  .required({ id: true });

// Type exports from Zod schemas
export type Task = z.infer<typeof selectTaskSchema>;
export type NewTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type TaskPriority = z.infer<typeof taskPriorityEnum>;
