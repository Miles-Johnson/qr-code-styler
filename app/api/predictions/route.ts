import Replicate from "replicate";
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // 5 minutes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
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

    // Handle image conversion, and handle potential errors
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


    let prediction;
      try {
          prediction = await replicate.predictions.create({
          version: "d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb",
          input,
          });
      } catch (replicateError:any) {
          console.error("Error during Replicate API call:", replicateError);
          return NextResponse.json({
              detail: "Error communicating with Replicate API",
              error: replicateError.message,
            }, { status: 500 });
      }

    console.log("Replicate response:", prediction);

    if (prediction?.error) {
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }

    if (!prediction) {
        return NextResponse.json({detail: "No prediction returned from Replicate API"}, {status:500});
    }

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