import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getGeneratedImageByPredictionId } from "@/src/queries/select";
import { insertGeneratedImage } from "@/src/queries/insert";
import { put } from '@vercel/blob';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface ReplicatePrediction {
  id: string;
  status: string;
  output: string | null;
  input: {
    prompt?: string;
    image?: string;
    [key: string]: any;
  };
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  urls: {
    get: string;
    cancel: string;
  };
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Prevent Next.js/Vercel caching - https://github.com/replicate/replicate-javascript/issues/136
replicate.fetch = (url, options) => {
  return fetch(url, { ...options, cache: "no-store" });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { detail: "You must be signed in to view predictions" },
        { status: 401 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN not set");
      return NextResponse.json(
        { detail: "Server configuration error" },
        { status: 500 }
      );
    }

    let prediction: ReplicatePrediction;
    try {
      prediction = await replicate.predictions.get(params.id) as ReplicatePrediction;
    } catch (error) {
      console.error("Replicate API error:", error);
      return NextResponse.json(
        { detail: "Failed to fetch prediction from Replicate" },
        { status: 502 }
      );
    }

    if (!prediction) {
      return NextResponse.json({ 
        detail: "Prediction not found"
      }, { status: 404 });
    }

    if (prediction?.error) {
      console.error("Prediction error:", prediction.error);
      return NextResponse.json({ 
        detail: prediction.error,
        status: prediction.status || "error"
      }, { status: 500 });  
    }

    // Only proceed with storage if prediction is completed and has output
    if (prediction.status === 'succeeded' && prediction.output && prediction.output.length > 0) {
    try {
      // Check if image already exists in database
      const existingImage = await getGeneratedImageByPredictionId(params.id);
      if (existingImage) {
        return NextResponse.json({
          ...prediction,
          storedData: existingImage
        });
      }

      // Download image from Replicate with retries
      const imageUrl = prediction.output[prediction.output.length - 1];
      let imageResponse;
      let retries = 0;
      let lastError;
      
      while (retries < MAX_RETRIES) {
        try {
          imageResponse = await fetch(imageUrl, { cache: 'no-store' });
          if (imageResponse.ok) break;
          lastError = `HTTP ${imageResponse.status}: ${imageResponse.statusText}`;
        } catch (error) {
          console.error(`Attempt ${retries + 1} failed:`, error);
          lastError = error instanceof Error ? error.message : 'Network error';
        }
        retries++;
        if (retries < MAX_RETRIES) {
          console.log(`Retrying download (attempt ${retries + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries - 1))); // Exponential backoff
        }
      }

      if (!imageResponse?.ok) {
        console.error(`Failed to download image: ${lastError}`);
        return NextResponse.json({
          detail: `Failed to download generated image after ${MAX_RETRIES} attempts`,
          error: lastError
        }, { status: 502 });
      }

      // Convert to Blob
      const imageBlob = await imageResponse.blob();
      const fileName = `${params.id}-${Date.now()}.png`;

      // Upload to Vercel Blob
      const blob = await put(fileName, imageBlob, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      // Store in database
      const storedData = await insertGeneratedImage({
        userId: session.user.id,
        predictionId: params.id,
        prompt: prediction.input?.prompt || '',
        imageUrl: blob.url,
        originalQrUrl: prediction.input.image || '',
        width: 512,
        height: 512
      });

      // Return both URLs - the temporary replicate URL and the permanent blob URL
      return NextResponse.json({
        ...prediction,
        storedData,
        urls: {
          temporary: prediction.output[prediction.output.length - 1], // replicate URL
          permanent: blob.url // blob storage URL
        }
      });
    } catch (error) {
      console.error('Error storing generated image:', error);
      // Return prediction even if storage fails
      return NextResponse.json({
        ...prediction,
        storageError: 'Failed to store generated image'
      });
    }
  }

    // Return prediction as-is if not completed
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      detail: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
