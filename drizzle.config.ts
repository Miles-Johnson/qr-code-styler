import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Parse connection string
const connectionString = new URL(process.env.DATABASE_URL);
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
