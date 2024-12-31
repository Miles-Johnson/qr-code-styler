import Replicate from "replicate";
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes
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

    if (image && image instanceof File) {
      // Convert File to base64 or handle as binary
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');
      input.image = `data:${image.type};base64,${base64Image}`;
    }

    console.log("Sending to Replicate with input:", {
      ...input,
      image: input.image ? "<<base64 data>>" : undefined
    });

    const prediction = await replicate.predictions.create({
      version: "d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb",
      input,
    });

    console.log("Replicate response:", prediction);

    if (prediction?.error) {
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }

    return NextResponse.json(prediction, { status: 201 });
  } catch (error: any) {
    console.error("Full error:", error);
    return NextResponse.json({
      detail: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// Add configuration for larger file sizes if needed
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '10mb'
//     }
//   }
// };