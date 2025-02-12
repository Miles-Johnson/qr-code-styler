import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getGeneratedImagesByUserId } from "@/src/queries/select";
import { db } from "@/src/db";
import { users } from "@/src/schema";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    auth: {},
    database: {},
    images: {}
  };

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    debugInfo.auth = {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      status: session ? 'authenticated' : 'unauthenticated'
    };

    // Check database connection
    try {
      const dbCheck = await db.select().from(users).limit(1);
      debugInfo.database = {
        connection: 'success',
        usersFound: dbCheck.length
      };
    } catch (dbError) {
      debugInfo.database = {
        connection: 'error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      };
    }

    // If authenticated, check images
    if (session?.user?.id) {
      try {
        const images = await getGeneratedImagesByUserId(session.user.id);
        debugInfo.images = {
          count: images.length,
          urls: await Promise.all(images.map(async (img) => {
            try {
              const response = await fetch(img.imageUrl, { method: 'HEAD' });
              return {
                id: img.id,
                url: img.imageUrl,
                accessible: response.ok,
                status: response.status,
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length')
              };
            } catch (error) {
              return {
                id: img.id,
                url: img.imageUrl,
                accessible: false,
                error: error instanceof Error ? error.message : 'Failed to check image'
              };
            }
          }))
        };
      } catch (imagesError) {
        debugInfo.images = {
          error: imagesError instanceof Error ? imagesError.message : 'Failed to fetch images'
        };
      }
    }

    return new NextResponse(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error',
      debugInfo
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
