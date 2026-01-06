import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title"),
  type: text("type").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas
export const selectChatSessionSchema = createSelectSchema(chatSessions, {
  type: z.enum(["ask", "generate"]),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions, {
  userId: z.uuid("Invalid user ID"),
  title: z.string().optional().nullable(),
  type: z.enum(["ask", "generate"]),
});

// Update schema
export const updateChatSessionSchema = insertChatSessionSchema
  .partial()
  .required({ id: true });

// Types
export type ChatSession = z.infer<typeof selectChatSessionSchema>;
export type NewChatSession = z.infer<typeof insertChatSessionSchema>;
export type UpdateChatSession = z.infer<typeof updateChatSessionSchema>;
