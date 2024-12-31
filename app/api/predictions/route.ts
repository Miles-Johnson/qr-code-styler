import Replicate from "replicate";
import { NextRequest, NextResponse } from 'next/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});


export async function POST(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
     return NextResponse.json({ detail: "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it." }, { status: 500 })
  }

  try {
        const data = await req.formData();
        const prompt = data.get("prompt")?.toString() || "optical illusion 3D maze box creative genius unreal engine black and gray, and colorful magic and spells at the background";
        const image = data.get("image");

        const input:any = {
            seed: -1,
            prompt,
            output_format: "png",
            negative_prompt: "blurry, horror, nsfw",
        };

       if (image && image instanceof File) {
          input.image = image;
        }

    const prediction = await replicate.predictions.create({
        version: "d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb",
        input,
    });

    if (prediction?.error) {
       return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }
    return NextResponse.json(prediction, { status: 201 });
  } catch (error:any) {
      return NextResponse.json({detail: error.message}, {status: 500})
  }
}