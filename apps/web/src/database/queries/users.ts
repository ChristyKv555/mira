import { eq } from 'drizzle-orm';
import { getDrizzleClient } from '../client';
import { users, type User, type NewUser } from '../schema';

export async function getUserById(userId: string): Promise<User | null> {
  const db = getDrizzleClient();
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDrizzleClient();
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function createUser(userData: NewUser): Promise<User> {
  const db = getDrizzleClient();
  const result = await db.insert(users).values(userData).returning();
  return result[0];
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<NewUser, 'id' | 'createdAt'>>
): Promise<User | null> {
  const db = getDrizzleClient();
  const result = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return result[0] || null;
}

