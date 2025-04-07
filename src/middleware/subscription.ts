import { NextRequest, NextResponse } from 'next/server';
// Removed getUserSubscription import as it's no longer called here
import { canGenerateImage, incrementGenerationCount } from '../utils/subscription';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function subscriptionMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  try {
    // Get user from session using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if user can generate image
    const { canGenerate, reason, remaining } = await canGenerateImage(userId);
    
    if (!canGenerate) {
      return NextResponse.json(
        { 
          error: 'Generation limit reached',
          reason,
          remaining,
          upgradeUrl: '/subscription/upgrade'
        },
        { status: 403 }
      );
    }

    // Middleware now only checks if user *can* generate,
    // the handler will fetch specific limits if needed.
    const response = await handler(req); // Pass original request

    // If successful, increment the generation count
    if (response.status === 200 || response.status === 201) {
      await incrementGenerationCount(userId);
    }
    
    return response;
    
  } catch (error) {
    console.error('Subscription middleware error:', error);
    // Keep the specific error reporting for now
    const errorMessage = error instanceof Error ? error.message : 'Unknown subscription processing error';
    return NextResponse.json(
      { error: `Subscription Middleware Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
