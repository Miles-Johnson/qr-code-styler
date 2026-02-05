import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserSubscription, SUBSCRIPTION_TIERS, TIER_LIMITS } from '@/src/utils/subscription';
import { getUserByEmail } from '@/src/queries/select';
import { insertUser } from '@/src/queries/insert';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const userName = session?.user?.name;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    let user = await getUserByEmail(userEmail);
    
    // If user doesn't exist, create them with free tier
    if (!user) {
      console.log('Creating new user record for:', userEmail);
      const [newUser] = await insertUser({
        email: userEmail,
        name: userName || '',
        subscriptionTier: SUBSCRIPTION_TIERS.FREE,
        monthlyGenerationCount: 0,
        monthlyGenerationReset: new Date()
      });
      user = newUser;
    }

    // Get subscription info
    const subscription = await getUserSubscription(user.id);

    return NextResponse.json({
      tier: subscription.tier,
      monthlyGenerationCount: subscription.monthlyGenerationCount,
      limits: subscription.limits,
      expiresAt: subscription.expiresAt
    });

  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription information' },
      { status: 500 }
    );
  }
}
