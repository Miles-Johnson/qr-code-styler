import Replicate from "replicate";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getUserByEmail } from "@/src/queries/select";
import { insertGeneratedImage } from "@/src/queries/insert";
import { put } from '@vercel/blob';
import { subscriptionMiddleware } from "@/src/middleware/subscription";

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

    const data = await req.json();
    const formData = new FormData();
    formData.append("prompt", data.prompt || "default prompt...");
    if (data.image) {
      formData.append("image", data.image);
    }

    const input: any = {
      seed: -1,
      prompt: data.prompt || "default prompt...",
      output_format: "png",
      negative_prompt: "blurry, horror, nsfw",
      width: data.maxWidth,
      height: data.maxHeight
    };

    // Handle image conversion for Replicate if image exists
    if (data.image) {
      input.image = data.image;
    }

    console.log("Sending to Replicate with input:", {
      ...input,
      image: input.image ? "<<base64 data>>" : undefined
    });

    // Create prediction with queue priority
    const options: any = {
      version: "d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb",
      input,
      priority: data.queuePriority || 0,
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
