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

    // Clone headers and add subscription limits
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-Max-Width', String(maxWidth));
    requestHeaders.set('X-Max-Height', String(maxHeight));
    requestHeaders.set('X-Queue-Priority', String(queuePriority));
    // Explicitly preserve Content-Type just in case
    if (req.headers.has('Content-Type')) {
      requestHeaders.set('Content-Type', req.headers.get('Content-Type')!);
    }

    // Pass the original request with modified headers to the handler
    const response = await handler(new NextRequest(req.url, {
      headers: requestHeaders, // Use headers with explicit Content-Type
      method: req.method,
      body: req.body // Pass original body (FormData)
      // duplex: 'half' // Removed due to TS error, likely not needed for FormData
    }));

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
