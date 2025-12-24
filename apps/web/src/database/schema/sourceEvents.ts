import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { integrations } from "./integrations";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Source Events
export const sourceEvents = pgTable("source_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  integrationId: uuid("integration_id").references(() => integrations.id),
  platform: text("platform").notNull(),
  externalId: text("external_id").notNull(),
  rawContent: text("raw_content").notNull(),
  metadata: text("metadata"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const selectSourceEventSchema = createSelectSchema(sourceEvents);
export const insertSourceEventSchema = createInsertSchema(sourceEvents, {
  userId: z.uuid("Invalid user ID"),
  integrationId: z.uuid("Invalid integration ID").optional(),
  platform: z.enum(["slack", "google-calendar", "google-mail"], {
    message: "Platform must be slack, google-calendar, or google-mail",
  }),
  externalId: z.string().min(1, "External ID is required"),
  rawContent: z.string().min(1, "Raw content is required"),
  metadata: z.string().optional(), // JSON string
  processedAt: z.date().optional(),
});

// Update schema
export const updateSourceEventSchema = insertSourceEventSchema
  .partial()
  .required({ id: true });

// Types
export type SourceEvent = z.infer<typeof selectSourceEventSchema>;
export type NewSourceEvent = z.infer<typeof insertSourceEventSchema>;
export type UpdateSourceEvent = z.infer<typeof updateSourceEventSchema>;
