import Replicate from "replicate";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getUserByEmail } from "@/src/queries/select";
import { insertGeneratedImage } from "@/src/queries/insert";
import { put } from '@vercel/blob';

export const maxDuration = 60; // 5 minutes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  
  if (!userEmail) {
    return NextResponse.json(
      { detail: "You must be signed in to create QR codes" },
      { status: 401 }
    );
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({
      detail: "REPLICATE_API_TOKEN not set"
    }, { status: 500 });
  }

  try {
    const data = await req.formData();
    const prompt = data.get("prompt")?.toString() || "default prompt...";
    const image = data.get("image");

    // Debug logging
    console.log("Received prompt:", prompt);
    console.log("Image type:", image instanceof File ? "File" : typeof image);
    if (image instanceof File) {
      console.log("Image size:", image.size);
      console.log("Image type:", image.type);
    }

    const input: any = {
      seed: -1,
      prompt,
      output_format: "png",
      negative_prompt: "blurry, horror, nsfw",
    };

    // Handle image conversion for Replicate
    if (image && image instanceof File) {
      try {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        input.image = `data:${image.type};base64,${base64Image}`;
      } catch (imageError: any) {
        console.error("Error converting image to base64:", imageError);
        return NextResponse.json({
          detail: "Error processing image. Could not convert to base64",
          error: imageError.message
        }, { status: 400 });
      }
    }

    console.log("Sending to Replicate with input:", {
      ...input,
      image: input.image ? "<<base64 data>>" : undefined
    });

    // Create prediction
    let prediction;
    try {
      prediction = await replicate.predictions.create({
        version: "d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb",
        input,
      });
      console.log("Replicate prediction created:", prediction);
    } catch (replicateError:any) {
      console.error("Error during Replicate API call:", replicateError);
      return NextResponse.json({
        detail: "Error communicating with Replicate API",
        error: replicateError.message,
      }, { status: 500 });
    }

    if (!prediction) {
      console.error("No prediction returned from Replicate API");
      return NextResponse.json({
        detail: "No prediction returned from Replicate API"
      }, { status: 500 });
    }

    if (prediction.error) {
      console.error("Prediction error:", prediction.error);
      return NextResponse.json({
        detail: prediction.error
      }, { status: 500 });
    }

    // Get user from database
    const user = await getUserByEmail(userEmail);
    if (!user) {
      console.error("User not found in database");
      return NextResponse.json(prediction, { status: 201 }); // Return prediction even if user not found
    }

    // Store original QR code if provided
    let originalQrUrl = '';
    if (image instanceof File) {
      try {
        console.log("Storing original QR code...");
        const originalBlob = await put(image.name, image, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        originalQrUrl = originalBlob.url;
        console.log("Original QR code stored at:", originalQrUrl);
      } catch (storageError) {
        console.error("Error storing original QR code:", storageError);
        // Continue without storing original QR code
      }
    }

    // Return the prediction immediately to start polling
    // We'll store the generated image later when it's ready
    console.log("Returning prediction for polling:", prediction);
    return NextResponse.json(prediction, { status: 201 });
  } catch (error: any) {
    console.error("Full error:", error);
    return NextResponse.json({
      detail: "An unexpected error occurred.",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
