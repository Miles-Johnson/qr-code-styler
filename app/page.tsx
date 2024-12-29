import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Initial request to start the prediction
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();

      // Poll for the result
      const checkPrediction = async (id: string) => {
        const statusResponse = await fetch(`/api/predictions/${id}`);
        const statusData = await statusResponse.json();

        if (statusData.output) {
          setResult(statusData.output[0]); // Note the [0] to get the first output
          setLoading(false);
        } else if (statusData.error) {
          throw new Error(statusData.error || "QR code generation failed");
        } else {
          // Wait 1 second before checking again
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await checkPrediction(id);
        }
      };

      // Start polling
      await checkPrediction(data.id);
    } catch (error: any) {
      console.error("Error:", error);
      setLoading(false);
      setError(error.message || "Failed to generate QR code");
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setImageUrl(base64Image);
    }
  };

  return (
    <main>
      <form id="qr-generator-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="prompt">Prompt:</label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="image">Image:</label>
          <input type="file" id="image" onChange={handleImageChange} />
        </div>
        <button type="submit">Generate QR Code</button>
      </form>

      {loading && (
        <div id="loading">
          <p>Generating your QR code...</p>
        </div>
      )}

      {result && (
        <div id="result-container">
          <h3 className="cs-title">Your Generated QR Code</h3>
          <div className="qr-display">
            <img id="qr-result" src={result} alt="Generated QR Code" />
          </div>
          <div className="qr-info">
            <p className="prompt-used">Prompt: {prompt}</p>
            {/* Add download button logic here if needed */}
          </div>
        </div>
      )}

      {error && (
        <div id="error-message">
          <p>{error}</p>
        </div>
      )}
    </main>
  );
}
