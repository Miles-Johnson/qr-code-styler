import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Database URL environment variable is required');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema: schema });

const checkTable = async (tableName: string) => {
  const result = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    );
  `;
  return result[0]?.exists;
};

const main = async () => {
  try {
    console.log('Starting migration process...');
    console.log('Using database:', process.env.NODE_ENV === 'development' ? 'development' : 'production');
    
    // Check tables before migration
    console.log('Checking existing tables...');
    const hasUsersBefore = await checkTable('users');
    const hasImagesBefore = await checkTable('generated_images');
    console.log('Before migration:', {
      users: hasUsersBefore ? 'exists' : 'not found',
      generated_images: hasImagesBefore ? 'exists' : 'not found'
    });

    // Check database permissions
    console.log('Checking database permissions...');
    const permissionCheck = await sql`SELECT current_user, current_database()`;
    console.log('Current user and database:', permissionCheck);

    // Try direct table creation
    console.log('Attempting direct table creation...');
    try {
      // Drop tables if they exist
      await sql`DROP TABLE IF EXISTS "generated_images" CASCADE`;
      await sql`DROP TABLE IF EXISTS "users" CASCADE`;
      console.log('Dropped existing tables');

      // Create users table
      console.log('Creating users table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "email" text NOT NULL UNIQUE,
          "name" text,
          "hashed_password" text DEFAULT '$2a$10$5m6escv2tz/zapH6fMUkDeKfSBwuvE7sMGHLv75gkINil5JQHOdhC' NOT NULL,
          "role" text DEFAULT 'user' NOT NULL,
          "email_verified" boolean DEFAULT false NOT NULL,
          "last_login" timestamp,
          "created_at" timestamp DEFAULT now()
        )
      `;
      console.log('Users table created');

      // Create generated_images table
      console.log('Creating generated_images table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "generated_images" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL REFERENCES "users"("id"),
          "image_url" text NOT NULL,
          "prompt" text NOT NULL,
          "original_qr_url" text NOT NULL,
          "created_at" timestamp DEFAULT now(),
          "prediction_id" text NOT NULL,
          "width" integer NOT NULL,
          "height" integer NOT NULL
        )
      `;
      console.log('Generated_images table created');
      console.log('Tables created successfully');
    } catch (createError) {
      console.error('Error creating tables:', createError);
      throw createError;
    }

    // Verify tables after migration
    console.log('Verifying tables after migration...');
    const hasUsersAfter = await checkTable('users');
    const hasImagesAfter = await checkTable('generated_images');
    console.log('After migration:', {
      users: hasUsersAfter ? 'exists' : 'not found',
      generated_images: hasImagesAfter ? 'exists' : 'not found'
    });

    if (!hasUsersAfter || !hasImagesAfter) {
      throw new Error(`Migration verification failed:
        users table: ${hasUsersAfter ? 'created' : 'missing'}
        generated_images table: ${hasImagesAfter ? 'created' : 'missing'}`);
    }

    // Check table structure
    console.log('Checking table columns...');
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users';
    `;
    console.log('Users table structure:', tableInfo);
    
    console.log('Migration completed and verified successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
