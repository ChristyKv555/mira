import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { chatSessions } from "./chatSessions";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatSessionId: uuid("chat_session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  role: text("role").notNull(),
  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const selectChatMessageSchema = createSelectSchema(chatMessages, {
  role: z.enum(["user", "assistant"]),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages, {
  chatSessionId: z.uuid("Invalid chat session ID"),
  userId: z.uuid("Invalid user ID"),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content is required"),
});

// Update schema
export const updateChatMessageSchema = insertChatMessageSchema
  .partial()
  .required({ id: true });

// Types
export type ChatMessage = z.infer<typeof selectChatMessageSchema>;
export type NewChatMessage = z.infer<typeof insertChatMessageSchema>;
export type UpdateChatMessage = z.infer<typeof updateChatMessageSchema>;
