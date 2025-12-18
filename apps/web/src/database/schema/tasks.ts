import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'in_progress',
  'in_review',
  'done',
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

