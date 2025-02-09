import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: schema });

const main = async () => {
  try {
    const result = await db.insert(schema.users).values({
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }).returning();
    
    console.log('Inserted user:', result);

    // Verify we can read the user back
    const users = await db.query.users.findMany();
    console.log('All users:', users);
  } catch (error) {
    console.error('Error inserting test user:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
