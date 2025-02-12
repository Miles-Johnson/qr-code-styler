import { NextRequest, NextResponse } from "next/server";
import { list } from '@vercel/blob';
import { db } from '@/src/db';
import { generatedImages } from '@/src/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Starting image recovery process...');
    console.log('Environment check:', {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      userId
    });
    
    // List all blobs in storage
    console.log('Attempting to list blobs...');
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN as string
    });

    console.log('Blob storage response:', {
      blobCount: blobs.length,
      sampleBlob: blobs[0] ? {
        url: blobs[0].url,
        pathname: blobs[0].pathname
      } : null
    });

    const results = {
      processed: 0,
      recovered: 0,
      skipped: 0,
      errors: 0
    };

    // Process each blob
    for (const blob of blobs) {
      try {
        results.processed++;
        
        // Extract prediction ID from filename (format: {predictionId}-{timestamp}.png)
        const predictionId = blob.pathname.split('-')[0];
        
        // Skip if already in database
        const existing = await db.select()
          .from(generatedImages)
          .where(eq(generatedImages.predictionId, predictionId));

        if (existing.length > 0) {
          console.log(`Image for prediction ${predictionId} already exists in database`);
          results.skipped++;
          continue;
        }

        // Insert new record
        await db.insert(generatedImages).values({
          userId,
          predictionId,
          imageUrl: blob.url,
          prompt: 'Recovered image', // Default prompt for recovered images
          width: 512,
          height: 512
        });

        results.recovered++;
        console.log(`Recovered image for prediction ${predictionId}`);
      } catch (error) {
        results.errors++;
        console.error(`Error processing blob ${blob.pathname}:`, error);
      }
    }

    console.log('Image recovery process completed');
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error during image recovery:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
