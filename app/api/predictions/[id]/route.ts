import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Prediction ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const prediction = await replicate.predictions.get(id);

    return new NextResponse(JSON.stringify(prediction), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error fetching prediction:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error fetching prediction' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
