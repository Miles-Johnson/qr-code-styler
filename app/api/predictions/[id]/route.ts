import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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
    const prediction = await replicate.predictions.get(params.id);

    if (!prediction) {
      return NextResponse.json(
        { detail: "Prediction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(prediction);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message },
      { status: 500 }
    );
  }
}
