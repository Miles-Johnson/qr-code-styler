import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  updateUserSubscription, 
  recordPayment, 
  SUBSCRIPTION_TIERS,
  type SubscriptionTier 
} from '@/src/utils/subscription';
import { db } from '@/src/db';
import { subscriptionPlans, users, payments } from '@/src/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to get plan from Stripe price ID
async function getPlanFromPriceId(priceId: string) {
  const plan = await db.select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.stripePriceId, priceId))
    .limit(1);
    
  return plan && plan.length > 0 ? plan[0] : null;
}

// Helper function to find user by email
async function findUserByEmail(email: string) {
  const user = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
    
  return user && user.length > 0 ? user[0] : null;
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
  
  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get user ID from the client reference ID
        const userId = session.client_reference_id;
        const planId = session.metadata?.planId;
        
        if (!userId || !planId) {
          console.error('Missing userId or planId in session:', session.id);
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }
        
        // Get plan details
        const plan = await db.select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, planId))
          .limit(1);
          
        if (!plan || plan.length === 0) {
          console.error('Invalid plan ID:', planId);
          return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }
        
        // Calculate subscription expiration (1 month from now since we only do monthly)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        
        // Update user subscription
        await updateUserSubscription(
          userId,
          plan[0].name.toLowerCase() as SubscriptionTier,
          expiresAt,
          session.subscription as string
        );
        
        // Record payment
        await recordPayment({
          userId,
          planId,
          amount: session.amount_total || plan[0].price,
          stripePaymentIntentId: session.payment_intent as string,
          stripeSubscriptionId: session.subscription as string,
          status: 'completed'
        });
        
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        let userId = subscription.metadata.userId || '';
        let planId = subscription.metadata.planId || '';
        
        if (!userId || !planId) {
          // Try to find user by customer ID
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          if (!('deleted' in customer) && customer.email) {
            const user = await findUserByEmail(customer.email);
            
            if (user) {
              userId = user.id;
              
              // Get plan from subscription item's price
              const subscriptionItem = subscription.items.data[0];
              const plan = await getPlanFromPriceId(subscriptionItem.price.id);
              
              if (plan) {
                planId = plan.id;
              } else {
                console.error('Cannot determine plan for invoice payment:', invoice.id);
                return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
              }
            } else {
              console.error('User not found for email:', customer.email);
              return NextResponse.json({ error: 'User not found' }, { status: 400 });
            }
          } else {
            console.error('Invalid customer or missing email:', invoice.customer);
            return NextResponse.json({ error: 'Invalid customer' }, { status: 400 });
          }
        }

        // Get plan details
        const plan = await db.select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, planId))
          .limit(1);
          
        if (!plan || plan.length === 0) {
          console.error('Invalid plan ID:', planId);
          return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }
        
        // Calculate new expiration date based on subscription period end
        const expiresAt = new Date(subscription.current_period_end * 1000);
        
        // Update user subscription
        await updateUserSubscription(
          userId,
          plan[0].name.toLowerCase() as SubscriptionTier,
          expiresAt,
          invoice.subscription as string
        );
        
        // Record payment
        await recordPayment({
          userId,
          planId,
          amount: invoice.amount_paid,
          stripePaymentIntentId: invoice.payment_intent as string,
          stripeSubscriptionId: invoice.subscription as string,
          status: 'completed'
        });
        
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        
        if (!userId) {
          console.error('Missing userId in subscription metadata:', subscription.id);
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }
        
        // Get plan from subscription item's price
        const subscriptionItem = subscription.items.data[0];
        const plan = await getPlanFromPriceId(subscriptionItem.price.id);
        
        if (!plan) {
          console.error('No matching plan found for price:', subscriptionItem.price.id);
          return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
        }
        
        // Calculate new expiration date based on the current period end
        const expiresAt = new Date(subscription.current_period_end * 1000);
        
        // Update the user's subscription
        await updateUserSubscription(
          userId,
          plan.name.toLowerCase() as SubscriptionTier,
          expiresAt,
          subscription.id
        );
        
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata.userId;
        
        if (userId) {
          // Record the failed payment
          await recordPayment({
            userId,
            planId: subscription.metadata.planId || '',
            amount: invoice.amount_due,
            stripePaymentIntentId: invoice.payment_intent as string,
            stripeSubscriptionId: invoice.subscription as string,
            status: 'failed'
          });
          
          // You could implement user notification here
          console.log(`Payment failed for subscription: ${subscription.id}, user: ${userId}`);
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        
        if (userId) {
          // Downgrade to free plan with immediate expiry
          const immediateExpiry = new Date();
          await updateUserSubscription(
            userId,
            SUBSCRIPTION_TIERS.FREE,
            immediateExpiry
          );
        }
        
        break;
      }
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
