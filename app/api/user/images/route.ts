import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getGeneratedImagesByUserId } from "@/src/queries/select";
import { db } from "@/src/db";
import { users } from "@/src/schema";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get and validate session
    const session = await getServerSession(authOptions);
    console.log('Images Route - Session:', {
      id: session?.user?.id,
      email: session?.user?.email,
      status: session ? 'authenticated' : 'unauthenticated'
    });
    
    if (!session?.user?.id) {
      console.log('Images Route - No user ID in session');
      return new NextResponse(
        JSON.stringify({
          images: [],
          pagination: {
            total: 0,
            limit: 10,
            offset: 0,
            hasMore: false
          }
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate and parse query parameters
    const searchParams = new URL(request.url).searchParams;
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    // Check database connection
    try {
      const dbCheck = await db.select().from(users).limit(1);
      console.log('Database connection check successful');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return new NextResponse(
        JSON.stringify({
          images: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false
          }
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user's images with pagination
    try {
      console.log('Images Route - Attempting to fetch images for user:', {
        userId: session.user.id,
        limit,
        offset
      });

      const images = await getGeneratedImagesByUserId(session.user.id);
      
      console.log('Images Route - Query Results:', {
        userId: session.user.id,
        imageCount: images.length,
        imageUrls: images.map(img => ({
          url: img.imageUrl,
          createdAt: img.createdAt,
          predictionId: img.predictionId
        }))
      });

      // Return empty array if no images found
      if (!images || images.length === 0) {
        console.log('Images Route - No images found');
        return new NextResponse(
          JSON.stringify({
            images: [],
            pagination: {
              total: 0,
              limit,
              offset,
              hasMore: false
            }
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Manual pagination since we're using Drizzle
      const paginatedImages = images.slice(offset, offset + limit);
      const total = images.length;

      const response = {
        images: paginatedImages,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };

      console.log('Images Route - Final response:', {
        imageCount: paginatedImages.length,
        total,
        hasMore: offset + limit < total,
        firstImageUrl: paginatedImages[0]?.imageUrl
      });

      return new NextResponse(
        JSON.stringify(response),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (queryError) {
      console.error('Error querying images:', queryError);
      return new NextResponse(
        JSON.stringify({
          images: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false
          }
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Error in images route:', error);
    return new NextResponse(
      JSON.stringify({
        images: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
