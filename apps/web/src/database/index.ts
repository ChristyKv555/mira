import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get database URL from environment variables
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Disable prefetch as it's not supported in "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export postgres client for raw SQL queries (e.g., vector search)
export { client as postgresClient };

// Export schema for use in other files
export * from "./schema";
