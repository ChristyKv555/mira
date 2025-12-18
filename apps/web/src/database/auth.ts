import { getSupabaseClient } from "./client";
import { getUserById, getUserByEmail, createUser } from "./queries";
import type { User } from "./schema";

/**
 * Get the current authenticated user from Supabase
 * @returns The authenticated user or null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      return null;
    }

    // Check if user exists in our database
    let user = await getUserById(authUser.id);

    // If user doesn't exist in database, create them
    if (!user && authUser.email) {
      user = await createUser({
        id: authUser.id,
        email: authUser.email,
        fullName: authUser.user_metadata?.full_name || null,
        avatarUrl: authUser.user_metadata?.avatar_url || null,
      });
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get user by email from Supabase auth
 * @param email User email
 * @returns The user or null
 */
export async function getUserFromAuth(email: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  return user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}
