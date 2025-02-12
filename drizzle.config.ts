import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

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
