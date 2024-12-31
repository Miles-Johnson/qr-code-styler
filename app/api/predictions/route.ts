import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }

  const data = await req.formData();

  const prompt = data.get("prompt")?.toString() || "optical illusion 3D maze box creative genius unreal engine black and gray, and colorful magic and spells at the background"
  const image = data.get("image")
  const input:any = {
      seed: -1,
      prompt,
      output_format: "png",
      negative_prompt: "blurry, horror, nsfw",
    }
  if(image) {
    input.image = image
  }
    try {
        const prediction = await replicate.predictions.create({
            version: "d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb",
            input,
            // Note: the version key corresponds to "miles-johnson/qr-code-generator:d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb"
            // See https://replicate.com/miles-johnson/qr-code-generator
        });

        if (prediction?.error) {
            return new Response(JSON.stringify({ detail: prediction.error}), {
                status: 500,
            });
        }

        return new Response(JSON.stringify(prediction), { status: 201 });
    } catch(error: any) {
       return new Response(JSON.stringify({detail: error.message}), {status: 500})
    }
}