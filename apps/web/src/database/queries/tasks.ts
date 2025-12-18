import { eq, and, desc } from 'drizzle-orm';
import { getDrizzleClient } from '../client';
import { tasks, type Task, type NewTask, type TaskStatus } from '../schema';

export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const db = getDrizzleClient();
  return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByStatus(
  userId: string,
  status: TaskStatus
): Promise<Task[]> {
  const db = getDrizzleClient();
  return await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.status, status)))
    .orderBy(desc(tasks.createdAt));
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const db = getDrizzleClient();
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  return result[0] || null;
}

export async function createTask(taskData: NewTask): Promise<Task> {
  const db = getDrizzleClient();
  const result = await db.insert(tasks).values(taskData).returning();
  return result[0];
}

export async function updateTask(
  taskId: string,
  updates: Partial<Omit<NewTask, 'id' | 'createdAt'>>
): Promise<Task | null> {
  const db = getDrizzleClient();
  const result = await db
    .update(tasks)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();
  return result[0] || null;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const db = getDrizzleClient();
  const result = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();
  return result.length > 0;
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task | null> {
  return updateTask(taskId, { status });
}

