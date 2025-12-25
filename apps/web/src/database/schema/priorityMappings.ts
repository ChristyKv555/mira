import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { taskPriorities } from "./taskPriorities";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Priority Mappings
export const priorityMappings = pgTable("priority_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  priorityId: uuid("priority_id")
    .notNull()
    .references(() => taskPriorities.id, { onDelete: "cascade" }),
  keywords: text("keywords").array().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas
export const selectPriorityMappingSchema = createSelectSchema(priorityMappings);
export const insertPriorityMappingSchema = createInsertSchema(
  priorityMappings,
  {
    userId: z.uuid("Invalid user ID"),
    priorityId: z.uuid("Invalid priority ID"),
    keywords: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
  }
);

// Update schema
export const updatePriorityMappingSchema = insertPriorityMappingSchema
  .partial()
  .required({ id: true });

// Types
export type PriorityMapping = z.infer<typeof selectPriorityMappingSchema>;
export type NewPriorityMapping = z.infer<typeof insertPriorityMappingSchema>;
export type UpdatePriorityMapping = z.infer<typeof updatePriorityMappingSchema>;
