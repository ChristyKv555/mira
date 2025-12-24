import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Platform Connections
export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  nangoConnectionId: text("nango_connection_id").notNull(),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const selectIntegrationSchema = createSelectSchema(integrations);
export const insertIntegrationSchema = createInsertSchema(integrations, {
  userId: z.uuid("Invalid user ID"),
  platform: z.enum(["slack", "google-calendar", "google-mail"], {
    message: "Platform must be slack, google-calendar, or google-mail",
  }),
  nangoConnectionId: z.string().min(1, "Nango connection ID is required"),
  isActive: z.number().int().min(0).max(1).default(1),
});

// Update schema
export const updateIntegrationSchema = insertIntegrationSchema
  .partial()
  .required({ id: true });

// Types
export type Integration = z.infer<typeof selectIntegrationSchema>;
export type NewIntegration = z.infer<typeof insertIntegrationSchema>;
export type UpdateIntegration = z.infer<typeof updateIntegrationSchema>;
