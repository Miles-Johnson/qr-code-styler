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
});

// Types for type-safety
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type NewGeneratedImage = typeof generatedImages.$inferInsert;
