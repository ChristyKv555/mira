import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { taskStatuses } from "./taskStatuses";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Status Mappings
export const statusMappings = pgTable("status_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  statusId: uuid("status_id")
    .notNull()
    .references(() => taskStatuses.id, { onDelete: "cascade" }),
  keywords: text("keywords").array().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas
export const selectStatusMappingSchema = createSelectSchema(statusMappings);
export const insertStatusMappingSchema = createInsertSchema(statusMappings, {
  userId: z.uuid("Invalid user ID"),
  statusId: z.uuid("Invalid status ID"),
  keywords: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

// Update schema
export const updateStatusMappingSchema = insertStatusMappingSchema
  .partial()
  .required({ id: true });

// Types
export type StatusMapping = z.infer<typeof selectStatusMappingSchema>;
export type NewStatusMapping = z.infer<typeof insertStatusMappingSchema>;
export type UpdateStatusMapping = z.infer<typeof updateStatusMappingSchema>;
