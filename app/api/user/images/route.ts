import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getGeneratedImagesByUserId } from "@/src/queries/select";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    console.log('Images Route - Session:', {
      id: session?.user?.id,
      email: session?.user?.email,
      status: session ? 'authenticated' : 'unauthenticated'
    });
    
    if (!session?.user?.id) {
      console.log('Images Route - No user ID in session');
      return NextResponse.json({ images: [] });
    }

    // Get images directly
    const images = await getGeneratedImagesByUserId(session.user.id);
    console.log('Images Route - Query Results:', {
      userId: session.user.id,
      imageCount: images.length,
      images: images.map(img => ({
        id: img.id,
        url: img.imageUrl,
        createdAt: img.createdAt
      }))
    });

    // Return images directly
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error in images route:', error);
    throw error; // Let Next.js handle the error
  }
}
