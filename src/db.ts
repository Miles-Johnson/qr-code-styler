import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Database URL environment variable is not set');
}

// Create SQL client with connection pooling
const sql = neon(DATABASE_URL);

// Create and export database instance with logging
export const db = drizzle(sql, {
  logger: {
    logQuery: (query, params) => {
      console.log('Debug - SQL Query:', {
        query,
        params,
        timestamp: new Date().toISOString()
      });
    }
  }
});
