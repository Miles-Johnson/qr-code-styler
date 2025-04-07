import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  hashedPassword: text('hashed_password').notNull().default('$2a$10$5m6escv2tz/zapH6fMUkDeKfSBwuvE7sMGHLv75gkINil5JQHOdhC'),
  role: text('role').notNull().default('user'),
  emailVerified: boolean('email_verified').notNull().default(false),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  // Subscription fields
  subscriptionTier: text('subscription_tier').notNull().default('free'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  monthlyGenerationCount: integer('monthly_generation_count').notNull().default(0),
  monthlyGenerationReset: timestamp('monthly_generation_reset').defaultNow(),
  stripeCustomerId: text('stripe_customer_id'),
});

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  stripePriceId: text('stripe_price_id').notNull(),
  price: integer('price').notNull(), // Price in cents
  maxMonthlyGenerations: integer('max_monthly_generations').notNull(),
  maxImageWidth: integer('max_image_width').notNull(),
  maxImageHeight: integer('max_image_height').notNull(),
  queuePriority: integer('queue_priority').notNull().default(0),
  features: text('features').notNull(), // JSON string of additional features
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  amount: integer('amount').notNull(), // Amount in cents
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  createdAt: timestamp('created_at').defaultNow(),
});

export const generatedImages = pgTable('generated_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  imageUrl: text('image_url').notNull(),
  prompt: text('prompt').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  predictionId: text('prediction_id').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  originalQrUrl: text('original_qr_url'),
});

// Types for type-safety
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type NewGeneratedImage = typeof generatedImages.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
