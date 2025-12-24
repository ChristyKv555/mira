import { pgTable, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";
import { users } from "./users";
import { taskStatuses } from "./taskStatuses";
import { taskPriorities } from "./taskPriorities";
import { sourceEvents } from "./sourceEvents";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tasks
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sourceEventId: uuid("source_event_id").references(() => sourceEvents.id),

  statusId: uuid("status_id").references(() => taskStatuses.id),
  priorityId: uuid("priority_id").references(() => taskPriorities.id),

  title: text("title").notNull(),
  description: text("description"),

  embedding: vector("embedding", { dimensions: 1536 }),

  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Note: Indexes should be created via SQL migration:
// CREATE INDEX tasks_user_id_index ON tasks(user_id);
// CREATE INDEX embedding_index ON tasks USING hnsw (embedding vector_cosine_ops);

// Zod schemas
export const selectTaskSchema = createSelectSchema(tasks, {
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  embedding: z.array(z.number()).optional(), // Zod handles vector as numeric array
});

export const insertTaskSchema = createInsertSchema(tasks, {
  userId: z.uuid("Invalid user ID"),
  sourceEventId: z.uuid("Invalid source event ID").optional(),
  statusId: z.uuid("Invalid status ID").optional(),
  priorityId: z.uuid("Invalid priority ID").optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  embedding: z.array(z.number()).optional(), // Zod handles vector as numeric array
  dueDate: z
    .union([z.date(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === "") return null;
      if (val instanceof Date) return val;
      if (typeof val === "string") {
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    }),
  completedAt: z
    .union([z.date(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === "") return null;
      if (val instanceof Date) return val;
      if (typeof val === "string") {
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    }),
});

// Update schema
export const updateTaskSchema = insertTaskSchema
  .partial()
  .required({ id: true });

// Types
export type Task = z.infer<typeof selectTaskSchema>;
export type NewTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
