import Replicate from "replicate";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getUserByEmail } from "@/src/queries/select"; // Keep for potential future use? Or remove if unused.
import { insertGeneratedImage } from "@/src/queries/insert"; // Keep for potential future use? Or remove if unused.
import { put } from '@vercel/blob'; // Keep for potential future use? Or remove if unused.
import { subscriptionMiddleware } from "@/src/middleware/subscription";
import { getUserSubscription } from "@/src/utils/subscription"; // Import needed function

export const maxDuration = 60; // 5 minutes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Prevent Next.js/Vercel caching - https://github.com/replicate/replicate-javascript/issues/136
replicate.fetch = (url, options) => {
  return fetch(url, { ...options, cache: "no-store" });
};

async function handlePrediction(req: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({
        detail: "REPLICATE_API_TOKEN not set"
      }, { status: 500 });
    }

    // Get user session directly in the handler
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // This should technically be caught by middleware, but double-check
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch subscription limits directly in the handler
    const subscription = await getUserSubscription(userId);
    const { maxWidth, maxHeight, queuePriority } = subscription.limits;

    // Parse FormData
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string || "default prompt...";
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: "No file provided in FormData" }, { status: 400 });
    }

    // Convert file to base64 data URI for Replicate
    const fileBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(fileBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64Image}`;

    const input: any = {
      seed: -1, // Or generate a random seed if desired
      prompt: prompt, // Use prompt from FormData
      output_format: "png",
      negative_prompt: "blurry, horror, nsfw", // Consider making this configurable
      width: maxWidth, // Use width from header
      height: maxHeight, // Use height from header
      image: dataUri // Use base64 image data
    };

    console.log("Sending to Replicate with input:", {
      ...input,
      image: input.image ? "<<base64 data>>" : undefined
    });

    // Create prediction with queue priority fetched directly
    const options: any = {
      version: "d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb", // Consider moving version to env var
      input,
      priority: queuePriority, // Use priority fetched directly
    };

    // Add webhook configuration if available
    const WEBHOOK_HOST = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NGROK_HOST;
      
    if (WEBHOOK_HOST) {
      options.webhook = `${WEBHOOK_HOST}/api/webhooks`;
      options.webhook_events_filter = ["start", "completed"];
    }

    const prediction = await replicate.predictions.create(options);
    return NextResponse.json(prediction, { status: 201 });
  } catch (error: any) {
    console.error("Prediction error:", error);
    return NextResponse.json({
      detail: "Error creating prediction",
      error: error.message
    }, { status: 500 });
  }
}

// Apply subscription middleware to the POST handler
export const POST = (req: NextRequest) => subscriptionMiddleware(req, handlePrediction);
