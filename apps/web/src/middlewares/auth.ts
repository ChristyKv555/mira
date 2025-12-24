/**
 * Type helper to extract User type from Supabase client
 */
type SupabaseUser = Awaited<
  ReturnType<
    ReturnType<
      typeof import("./supabase").createMiddlewareSupabaseClient
    >["auth"]["getUser"]
  >
>["data"]["user"];

/**
 * Gets the authenticated user from the Supabase session
 */
export async function getAuthenticatedUser(
  supabase: ReturnType<
    typeof import("./supabase").createMiddlewareSupabaseClient
  >
): Promise<SupabaseUser> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Checks if a user is authenticated
 */
export function isAuthenticated(
  user: SupabaseUser
): user is NonNullable<SupabaseUser> {
  return user !== null;
}

/**
 * Exported User type for use in other files
 */
export type User = NonNullable<SupabaseUser>;
