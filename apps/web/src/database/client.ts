import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Supabase client for auth and real-time features
// Works on both client and server side
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Drizzle client for database queries
let drizzleClient: ReturnType<typeof drizzle> | null = null;

export function getDrizzleClient() {
  if (!drizzleClient) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'Missing DATABASE_URL environment variable. Please set it in your .env file'
      );
    }

    const queryClient = postgres(databaseUrl);
    drizzleClient = drizzle(queryClient, { schema });
  }

  return drizzleClient;
}

// Server-side Supabase client with service role key (for admin operations)
let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
}

