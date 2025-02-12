import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Load environment variables
config({ path: ".env.local" });

async function testDatabase(url: string, name: string) {
  try {
    console.log(`Testing ${name} connection...`);
    const sql = neon(url);
    
    // Test basic connectivity
    const timeResult = await sql`SELECT NOW() as now`;
    console.log(`✅ ${name} basic connection successful:`, timeResult[0]?.now);
    
    // Test users table access
    const userResult = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ ${name} users table count:`, userResult[0]?.count);
    return true;
  } catch (error) {
    console.error(`❌ ${name} connection failed:`, error);
    return false;
  }
}

async function main() {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  
  // Test production database
  if (process.env.DATABASE_URL) {
    await testDatabase(process.env.DATABASE_URL, 'Production Database');
  } else {
    console.log('❌ Production database URL not configured');
  }
}

main().catch(console.error);
