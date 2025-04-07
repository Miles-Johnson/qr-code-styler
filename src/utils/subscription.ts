import { db } from '../db';
import { users, subscriptionPlans, payments } from '../schema';
import { eq, lt, and, desc, sql } from 'drizzle-orm';

// Define subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium'
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

// Define tier limits
export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxMonthlyGenerations: 10,
    maxWidth: 512,
    maxHeight: 512,
    queuePriority: 0,
    features: {
      standardGPU: true,
      standardQueue: true,
      basicQRIntegration: true
    }
  },
  [SUBSCRIPTION_TIERS.BASIC]: {
    maxMonthlyGenerations: 50,
    maxWidth: 1024,
    maxHeight: 1024,
    queuePriority: 1,
    features: {
      enhancedGPU: true,
      priorityQueue: true,
      premiumTemplates: 5,
      multipleExportFormats: true,
      basicAnalytics: true,
      emailSupport: true
    }
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    maxMonthlyGenerations: 200,
    maxWidth: 2048,
    maxHeight: 2048,
    queuePriority: 2,
    features: {
      advancedGPU: true,
      highestPriority: true,
      advancedQRCustomization: true,
      batchProcessing: true,
      comprehensiveAnalytics: true,
      apiAccess: true,
      prioritySupport: true
    }
  }
};

// Get a user's subscription plan
export async function getUserSubscription(userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user || user.length === 0) {
    throw new Error('User not found');
  }
  
  return {
    tier: user[0].subscriptionTier as SubscriptionTier,
    expiresAt: user[0].subscriptionExpiresAt,
    monthlyGenerationCount: user[0].monthlyGenerationCount,
    monthlyGenerationReset: user[0].monthlyGenerationReset,
    stripeCustomerId: user[0].stripeCustomerId,
    limits: TIER_LIMITS[user[0].subscriptionTier as SubscriptionTier]
  };
}

// Check if user can generate an image
export async function canGenerateImage(userId: string) {
  const subscription = await getUserSubscription(userId);
  
  // Check if subscription is expired
  if (subscription.tier !== SUBSCRIPTION_TIERS.FREE && 
      subscription.expiresAt && 
      new Date(subscription.expiresAt) < new Date()) {
    // Downgrade to free tier if subscription expired
    await db.update(users)
      .set({ 
        subscriptionTier: SUBSCRIPTION_TIERS.FREE,
        subscriptionExpiresAt: null 
      })
      .where(eq(users.id, userId));
      
    return {
      canGenerate: subscription.monthlyGenerationCount < TIER_LIMITS[SUBSCRIPTION_TIERS.FREE].maxMonthlyGenerations,
      reason: 'Subscription expired, downgraded to free tier',
      remaining: TIER_LIMITS[SUBSCRIPTION_TIERS.FREE].maxMonthlyGenerations - subscription.monthlyGenerationCount
    };
  }
  
  // Check if monthly reset is needed
  if (subscription.monthlyGenerationReset && 
      new Date(subscription.monthlyGenerationReset).getMonth() !== new Date().getMonth()) {
    // Reset monthly count
    await db.update(users)
      .set({ 
        monthlyGenerationCount: 0,
        monthlyGenerationReset: new Date()
      })
      .where(eq(users.id, userId));
      
    return {
      canGenerate: true,
      reason: 'Monthly generation count reset',
      remaining: subscription.limits.maxMonthlyGenerations
    };
  }
  
  // Check if user has reached their generation limit
  const canGenerate = subscription.monthlyGenerationCount < subscription.limits.maxMonthlyGenerations;
  
  return {
    canGenerate,
    reason: canGenerate ? 'Within generation limits' : 'Monthly generation limit reached',
    remaining: subscription.limits.maxMonthlyGenerations - subscription.monthlyGenerationCount
  };
}

// Increment generation count for a user
export async function incrementGenerationCount(userId: string) {
  return await db.update(users)
    .set({ 
      monthlyGenerationCount: sql`${users.monthlyGenerationCount} + 1`
    })
    .where(eq(users.id, userId))
    .returning();
}

// Update user subscription tier
export async function updateUserSubscription(
  userId: string, 
  tier: SubscriptionTier,
  expiresAt: Date,
  stripeSubscriptionId?: string
) {
  return await db.update(users)
    .set({ 
      subscriptionTier: tier,
      subscriptionExpiresAt: expiresAt,
      // Reset generation count when upgrading
      monthlyGenerationCount: 0,
      monthlyGenerationReset: new Date()
    })
    .where(eq(users.id, userId))
    .returning();
}

// Get all subscription plans
export async function getSubscriptionPlans() {
  return await db.select().from(subscriptionPlans);
}

// Record a payment
export async function recordPayment({
  userId,
  planId,
  amount,
  stripePaymentIntentId,
  stripeSubscriptionId,
  status = 'pending'
}: {
  userId: string;
  planId: string;
  amount: number;
  stripePaymentIntentId: string;
  stripeSubscriptionId?: string;
  status?: string;
}) {
  return await db.insert(payments)
    .values({
      userId,
      planId,
      amount,
      stripePaymentIntentId,
      stripeSubscriptionId,
      status
    })
    .returning();
}

// Get user payment history
export async function getUserPayments(userId: string) {
  return await db.select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}

// Update or create Stripe customer ID for user
export async function updateStripeCustomerId(userId: string, stripeCustomerId: string) {
  return await db.update(users)
    .set({ stripeCustomerId })
    .where(eq(users.id, userId))
    .returning();
}

// Get queue priority for user
export async function getQueuePriority(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId);
  return subscription.limits.queuePriority;
}
