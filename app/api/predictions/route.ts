import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, image } = await req.json();

    if (!prompt) {
      return new NextResponse(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const prediction = await replicate.predictions.create({
      version:
        'd9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb',
      input: {
        prompt: prompt,
        image: image || null,
        seed: -1,
        output_format: 'png',
        negative_prompt:
          '(worst quality, low quality, bad anatomy, blurry, unclear, sketch, cartoon, 3D render, watermark, text,nsfw, nudity)',
      },
    });

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
    console.error('Error creating prediction:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error creating prediction' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
