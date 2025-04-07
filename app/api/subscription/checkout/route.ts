import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSubscriptionPlans, SUBSCRIPTION_TIERS } from '@/src/utils/subscription';
import { db } from '@/src/db';
import { subscriptionPlans } from '@/src/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { planId } = await req.json();
    
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    
    // Get plan details
    const plan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);
      
    if (!plan || plan.length === 0) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }
    
    // Skip payment for free tier
    if (plan[0].name.toLowerCase() === SUBSCRIPTION_TIERS.FREE) {
      return NextResponse.json(
        { 
          success: true,
          redirectUrl: '/dashboard',
          message: 'Switched to free tier'
        },
        { status: 200 }
      );
    }
    
    // Get the Stripe price ID based on the plan
    const priceId = plan[0].name.toLowerCase() === SUBSCRIPTION_TIERS.BASIC 
      ? process.env.STRIPE_BASIC_PRICE_ID 
      : process.env.STRIPE_PREMIUM_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not found for plan' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`,
      client_reference_id: session.user.id,
      metadata: {
        planId: plan[0].id,
        userEmail: session.user.email,
      },
    });
    
    return NextResponse.json({ 
      sessionId: checkoutSession.id, 
      url: checkoutSession.url 
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
