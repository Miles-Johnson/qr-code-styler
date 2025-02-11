import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Use DEV_DATABASE_URL in development, DATABASE_URL in production
const DATABASE_URL = process.env.NODE_ENV === 'development' 
  ? process.env.DEV_DATABASE_URL 
  : process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Database URL environment variable is not set');
}

// Create SQL client with connection pooling
const sql = neon(DATABASE_URL);

// Create and export database instance
export const db = drizzle(sql);
