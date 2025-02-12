import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/src/db";
import { users, generatedImages } from "@/src/schema";
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      nextauth_url: process.env.NEXTAUTH_URL,
      has_database_url: !!process.env.DATABASE_URL,
      has_blob_token: !!process.env.BLOB_READ_WRITE_TOKEN,
      has_replicate_token: !!process.env.REPLICATE_API_TOKEN,
      has_nextauth_secret: !!process.env.NEXTAUTH_SECRET
    },
    auth: {},
    database: {},
    blob: {},
    migrations: {}
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

    // Check database connection and tables
    try {
      // Check users table
      const usersCount = await db.select({ count: users.id }).from(users);
      debugInfo.database.users = {
        connection: 'success',
        count: usersCount[0]?.count || 0
      };

      // Check generated_images table
      const imagesCount = await db.select({ count: generatedImages.id }).from(generatedImages);
      debugInfo.database.images = {
        connection: 'success',
        count: imagesCount[0]?.count || 0
      };

      if (session?.user?.id) {
        const userImages = await db
          .select()
          .from(generatedImages)
          .where(eq(generatedImages.userId, session.user.id));
        
        debugInfo.database.userImages = {
          count: userImages.length,
          samples: userImages.slice(0, 2).map(img => ({
            id: img.id,
            url: img.imageUrl,
            createdAt: img.createdAt
          }))
        };
      }
    } catch (dbError) {
      debugInfo.database.error = dbError instanceof Error ? dbError.message : 'Unknown database error';
    }

    // Check Blob storage
    try {
      // Create a test blob
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      const blob = await put(testFileName, testBlob, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      debugInfo.blob = {
        status: 'success',
        testUrl: blob.url,
        contentType: blob.contentType,
        pathname: blob.pathname
      };
    } catch (blobError) {
      debugInfo.blob.error = blobError instanceof Error ? blobError.message : 'Unknown blob error';
    }

    // Return debug info
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
