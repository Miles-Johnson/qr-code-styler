import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getGeneratedImageByPredictionId } from "@/src/queries/select";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { detail: "You must be signed in to view predictions" },
      { status: 401 }
    );
  }

  try {
    // Get prediction from Replicate
    const prediction = await replicate.predictions.get(params.id);
    console.log('Replicate prediction:', prediction);

    if (!prediction) {
      return NextResponse.json(
        { detail: "Prediction not found" },
        { status: 404 }
      );
    }

    // Try to get stored image data, but don't fail if not found
    try {
      const storedImage = await getGeneratedImageByPredictionId(params.id);
      if (storedImage) {
        const response = {
          ...prediction,
          storedImage,
        };
        console.log('Response with stored image:', response);
        return NextResponse.json(response);
      }
    } catch (storageError) {
      console.error("Error fetching stored image:", storageError);
      // Continue without stored image data
    }

    // Return prediction even if stored image data is not available
    console.log('Response without stored image:', prediction);
    return NextResponse.json(prediction);
  } catch (error: any) {
    console.error('Error in GET prediction:', error);
    return NextResponse.json(
      { detail: error.message },
      { status: 500 }
    );
  }
}
