import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Use DEV_DATABASE_URL in development, DATABASE_URL in production
const databaseUrl = process.env.NODE_ENV === 'development'
  ? process.env.DEV_DATABASE_URL
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Database URL environment variable is required');
}

// Parse connection string
const connectionString = new URL(databaseUrl);
const [username, password] = connectionString.username.split(':');
const database = connectionString.pathname.slice(1);

export default {
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: connectionString.hostname,
    port: parseInt(connectionString.port || '5432'),
    user: username,
    password: password,
    database: database,
    ssl: true,
  },
} satisfies Config;
