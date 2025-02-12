import { list } from '@vercel/blob';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { generatedImages } from './schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Ensure required environment variables are set
const requiredEnvVars = ['DATABASE_URL', 'BLOB_READ_WRITE_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is not set`);
  }
}

// Create database connection
const sql = neon(process.env.DATABASE_URL as string);
const db = drizzle(sql, {
  logger: true
});

// Define our own database functions instead of importing them
async function getGeneratedImageByPredictionId(predictionId: string) {
  const result = await db.select().from(generatedImages).where(eq(generatedImages.predictionId, predictionId));
  return result[0];
}

async function insertGeneratedImage(data: {
  userId: string;
  predictionId: string;
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
}) {
  return await db.insert(generatedImages).values(data).returning();
}

async function recoverImages(userId: string) {
  try {
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

    // Process each blob
    for (const blob of blobs) {
      try {
        // Extract prediction ID from filename (format: {predictionId}-{timestamp}.png)
        const predictionId = blob.pathname.split('-')[0];
        
        // Skip if already in database
        const existing = await getGeneratedImageByPredictionId(predictionId);
        if (existing) {
          console.log(`Image for prediction ${predictionId} already exists in database`);
          continue;
        }

        // Insert new record
        const image = await insertGeneratedImage({
          userId,
          predictionId,
          imageUrl: blob.url,
          prompt: 'Recovered image', // Default prompt for recovered images
          width: 512,
          height: 512
        });

        console.log(`Recovered image for prediction ${predictionId}`);
      } catch (error) {
        console.error(`Error processing blob ${blob.pathname}:`, error);
      }
    }

    console.log('Image recovery process completed');
  } catch (error) {
    console.error('Error during image recovery:', error);
    throw error;
  }
}

// Allow running from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Please provide a user ID');
    process.exit(1);
  }

  recoverImages(userId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Recovery failed:', error);
      process.exit(1);
    });
}

export { recoverImages };
