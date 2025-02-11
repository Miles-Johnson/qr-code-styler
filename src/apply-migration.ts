import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const main = async () => {
  try {
    console.log('Applying migration...');
    
    // Add hashed_password column with default value
    await sql`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "hashed_password" text NOT NULL 
      DEFAULT '$2a$10$5m6escv2tz/zapH6fMUkDeKfSBwuvE7sMGHLv75gkINil5JQHOdhC';
    `;

    // Add email_verified column
    await sql`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "email_verified" boolean NOT NULL 
      DEFAULT false;
    `;

    // Add last_login column
    await sql`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "last_login" timestamp;
    `;

    console.log('Migration complete');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
