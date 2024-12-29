// app/api/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export const dynamic = 'force-dynamic';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File | null;

    if (!prompt) {
      return new NextResponse(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let imageUrl = null;
    if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64Image = buffer.toString('base64');
        imageUrl = `data:${imageFile.type};base64,${base64Image}`;
    }

    // Create the prediction using Replicate
    console.log('Creating prediction with Replicate...');
    const prediction = await replicate.predictions.create({
      version:
        'd9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb',
      input: {
        prompt: prompt,
        image: imageUrl, // Pass either the URL or the base64 string
        seed: -1,
        output_format: 'png',
        negative_prompt:
          '(worst quality, low quality, bad anatomy, blurry, unclear, sketch, cartoon, 3D render, watermark, text,nsfw, nudity)',
      },
    });
    console.log('Replicate prediction:', prediction);

    return new NextResponse(
      JSON.stringify({
        id: prediction.id,
        status: 'processing',
      }),
      {
        status: 202,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in API route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'An error occurred on the server' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
