import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: schema });

const main = async () => {
  try {
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migration complete');
  } catch (error: any) {
    // If table already exists, consider it a success
    if (error.code === '42P07') {
      console.log('Tables already exist, migration not needed');
      process.exit(0);
    }
    console.error('Error during migration:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
