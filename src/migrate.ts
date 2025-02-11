import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema: schema });

const main = async () => {
  try {
    console.log('Starting migration...');
    
    // First, try to drop existing tables if they exist
    try {
      await sql`DROP TABLE IF EXISTS "generated_images" CASCADE`;
      await sql`DROP TABLE IF EXISTS "users" CASCADE`;
      console.log('Dropped existing tables');
    } catch (dropError) {
      console.error('Error dropping tables:', dropError);
    }

    // Then run the migrations
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migration complete');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
