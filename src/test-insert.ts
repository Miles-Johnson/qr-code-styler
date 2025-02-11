import { db } from './db.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    // Hash a test password
    const hashedPassword = await bcrypt.hash('testpassword123', 10);

    // Insert a test user
    const result = await db.insert(users).values({
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      hashedPassword,
      emailVerified: false
    }).returning();

    console.log('Inserted user:', result);

    // Query the user back
    const queriedUser = await db.select().from(users).where(eq(users.email, 'test@example.com'));
    console.log('Queried user:', queriedUser);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
