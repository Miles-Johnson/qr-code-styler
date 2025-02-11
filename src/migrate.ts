import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use DEV_DATABASE_URL in development, DATABASE_URL in production
const DATABASE_URL = process.env.NODE_ENV === 'development' 
  ? process.env.DEV_DATABASE_URL 
  : process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Database URL environment variable is required');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema: schema });

const main = async () => {
  try {
    console.log('Starting migration...');
    console.log('Using database:', process.env.NODE_ENV === 'development' ? 'development' : 'production');
    
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
