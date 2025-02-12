import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/src/db";
import { users, generatedImages } from "@/src/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get and validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Run diagnostic queries
    const diagnostics = {
      timestamp: new Date().toISOString(),
      userId: session.user.id,
      queries: {} as any
    };

    // 1. Check if user exists
    const user = await db.select().from(users).where(eq(users.id, session.user.id));
    diagnostics.queries.userCheck = {
      exists: user.length > 0,
      data: user[0]
    };

    // 2. Get total image count
    const imageCount = await db
      .select({ count: sql`count(*)::integer` })
      .from(generatedImages)
      .where(eq(generatedImages.userId, session.user.id));
    diagnostics.queries.imageCount = imageCount[0];

    // 3. Get all images with full details
    const images = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, session.user.id))
      .orderBy(sql`created_at DESC`);
    diagnostics.queries.images = {
      count: images.length,
      data: images
    };

    // 4. Run raw SQL count query for verification
    const rawCount = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::integer as count FROM generated_images WHERE user_id = ${session.user.id}`
    );
    diagnostics.queries.rawCount = rawCount.rows[0];

    return new NextResponse(
      JSON.stringify(diagnostics),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('DB Test Error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
