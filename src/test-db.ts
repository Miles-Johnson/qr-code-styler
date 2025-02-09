import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: schema });

const main = async () => {
  try {
    const users = await db.query.users.findMany();
    console.log('Users:', users);
  } catch (error) {
    console.error('Error querying users:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
