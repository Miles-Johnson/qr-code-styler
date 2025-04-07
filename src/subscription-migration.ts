import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const main = async () => {
  try {
    console.log('Applying subscription migration...');
    
    // Add subscription fields to users table
    await sql`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "subscription_tier" text NOT NULL DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS "subscription_expires_at" timestamp,
      ADD COLUMN IF NOT EXISTS "monthly_generation_count" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "monthly_generation_reset" timestamp DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
    `;
    
    // Create subscription_plans table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL UNIQUE,
        "stripe_price_id" text NOT NULL,
        "price" integer NOT NULL,
        "max_monthly_generations" integer NOT NULL,
        "max_image_width" integer NOT NULL,
        "max_image_height" integer NOT NULL,
        "queue_priority" integer NOT NULL DEFAULT 0,
        "features" text NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `;
    
    // Create payments table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "plan_id" uuid NOT NULL REFERENCES "subscription_plans"("id"),
        "amount" integer NOT NULL,
        "stripe_payment_intent_id" text NOT NULL,
        "stripe_subscription_id" text,
        "status" text NOT NULL DEFAULT 'pending',
        "created_at" timestamp DEFAULT now()
      );
    `;
    
    // Insert default subscription plans
    // Note: stripe_price_id is set to empty string initially - needs to be updated with actual Stripe price IDs
    await sql`
      INSERT INTO "subscription_plans" 
      ("name", "stripe_price_id", "price", "max_monthly_generations", "max_image_width", "max_image_height", "queue_priority", "features")
      VALUES 
      (
        'Free', 
        '', 
        0, 
        10, 
        512, 
        512, 
        0,
        '{"standardGPU":true,"standardQueue":true,"basicQRIntegration":true}'
      ),
      (
        'Basic', 
        '', 
        999, 
        50, 
        1024, 
        1024, 
        1,
        '{"enhancedGPU":true,"priorityQueue":true,"premiumTemplates":5,"multipleExportFormats":true,"basicAnalytics":true,"emailSupport":true}'
      ),
      (
        'Premium', 
        '', 
        1999, 
        200, 
        2048, 
        2048, 
        2,
        '{"advancedGPU":true,"highestPriority":true,"advancedQRCustomization":true,"batchProcessing":true,"comprehensiveAnalytics":true,"apiAccess":true,"prioritySupport":true}'
      )
      ON CONFLICT (name) DO NOTHING;
    `;

    console.log('Subscription migration complete');
  } catch (error) {
    console.error('Error during subscription migration:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
