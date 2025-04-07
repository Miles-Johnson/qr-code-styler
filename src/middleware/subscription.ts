import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription, canGenerateImage, incrementGenerationCount } from '../utils/subscription';
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
    
    // Get user subscription to determine image size limits
    const subscription = await getUserSubscription(userId);
    const { maxWidth, maxHeight, queuePriority } = subscription.limits;
    
    // Modify the request to include subscription data
    const requestData = await req.json();
    const modifiedRequest = new NextRequest(req.url, {
      headers: req.headers,
      method: req.method,
      body: JSON.stringify({
        ...requestData,
        maxWidth,
        maxHeight,
        queuePriority
      })
    });
    
    // Handle the request
    const response = await handler(modifiedRequest);
    
    // If successful, increment the generation count
    if (response.status === 200 || response.status === 201) {
      await incrementGenerationCount(userId);
    }
    
    return response;
    
  } catch (error) {
    console.error('Subscription middleware error:', error);
    return NextResponse.json(
      { error: 'Server error processing subscription' },
      { status: 500 }
    );
  }
}
