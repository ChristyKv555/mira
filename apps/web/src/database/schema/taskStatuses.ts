import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task Statuses
export const taskStatuses = pgTable("task_statuses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  key: text("key").notNull(),
  color: text("color"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const selectStatusSchema = createSelectSchema(taskStatuses);
export const insertStatusSchema = createInsertSchema(taskStatuses, {
  userId: z.uuid("Invalid user ID"),
  label: z.string().min(1, "Label is required"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code")
    .optional(),
  order: z.number().int().default(0),
});

// Update schema
export const updateStatusSchema = insertStatusSchema
  .partial()
  .required({ id: true });

// Types
export type TaskStatus = z.infer<typeof selectStatusSchema>;
export type NewTaskStatus = z.infer<typeof insertStatusSchema>;
export type UpdateTaskStatus = z.infer<typeof updateStatusSchema>;
