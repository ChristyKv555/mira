import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas
export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users, {
  email: z.email("Invalid email address"),
  name: z.string().min(1, "Name is required").optional(),
});

// Update schema
export const updateUserSchema = insertUserSchema
  .partial()
  .required({ id: true });

// Types
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
