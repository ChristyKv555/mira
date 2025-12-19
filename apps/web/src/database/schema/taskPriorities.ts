import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task Priorities
export const taskPriorities = pgTable("task_priorities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  key: text("key").notNull(),
  level: integer("level").notNull().default(0),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const selectPrioritySchema = createSelectSchema(taskPriorities);
export const insertPrioritySchema = createInsertSchema(taskPriorities, {
  userId: z.uuid("Invalid user ID"),
  label: z.string().min(1, "Label is required"),
  key: z.string().min(1, "Key is required"),
  level: z.number().int().default(0),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code")
    .optional(),
});

// Update schema
export const updatePrioritySchema = insertPrioritySchema
  .partial()
  .required({ id: true });

// Types
export type TaskPriority = z.infer<typeof selectPrioritySchema>;
export type NewTaskPriority = z.infer<typeof insertPrioritySchema>;
export type UpdateTaskPriority = z.infer<typeof updatePrioritySchema>;
