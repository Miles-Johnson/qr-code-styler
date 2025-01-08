"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Wand2, Zap, Shield, Eye, Palette } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Prediction } from "replicate"; // Removed PredictionError

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [predictionId, setPredictionId] = useState<string | null>(null);
    const [status, setStatus] = useState<
        "idle" | "processing" | "succeeded" | "failed"
    >("idle");
    const [activeTab, setActiveTab] = useState("url");
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName(null)
        }
    };


    const startPolling = async (id: string) => {
        let currentPrediction: Prediction | null = null;
        while (
            currentPrediction === null ||
            (currentPrediction.status !== "succeeded" &&
                currentPrediction.status !== "failed")
        ) {
            await sleep(1000);
            const response = await fetch(`/api/predictions/${id}`, {
                cache: "no-store",
            });
            if (response.status !== 200) {
                const errorData = await response.json();
                setError(errorData.detail);
                setStatus("failed");
                setLoading(false);
                return;
            }
            const updatedPrediction: Prediction = await response.json();
            currentPrediction = updatedPrediction;
            console.log({ updatedPrediction });
            setPrediction(updatedPrediction);
            if (
                updatedPrediction.status === "succeeded" ||
                updatedPrediction.status === "failed"
            ) {
                setLoading(false);
                setStatus(updatedPrediction.status);
            }
        }
    };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const prompt = (
            document.getElementById("prompt") as HTMLTextAreaElement
        ).value;
        const imageInput = document.getElementById(
            "image"
        ) as HTMLInputElement;
        const image = imageInput.files ? imageInput.files[0] : null;

        const formData = new FormData();
        formData.append("prompt", prompt);
        if (image) {
            formData.append("image", image);
        }
        try {
            const response = await fetch("/api/predictions", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail);
                setStatus("failed");
                setLoading(false);
                return;
            }

            const data = await response.json();
            setPredictionId(data.id);
            setStatus("processing");
            startPolling(data.id);
        } catch (error) {
            console.error("Error submitting form:", error);
            setError("Failed to generate QR code. Please try again.");
            setLoading(false);
            setStatus("failed");
        }
    };



// Extract feature data for better maintainability
const features = [
    {
        icon: Palette,
        title: "Brand Matching",
        description: "Perfect integration with your brand's visual identity",
    },
    {
        icon: Eye,
        title: "Enhanced Visibility",
        description: "Improved scannability at any size while maintaining style",
    },
    {
        icon: Shield,
        title: "Future-Proof",
        description: "Dynamic URL capability for long-term flexibility",
    },
];

// Extract example QR codes data
const exampleQRCodes = [
  {
      title: "Modern Minimalist",
      image: "/images/00005-2079859742.png",
  },
  {
      title: "Artistic Blend",
      image: "/images/00008-4148124438.0.png",
  },
  {
      title: "Brand Integration",
      image: "/images/Control.png",
  },
];


return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <QrCode className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-amber-500 bg-clip-text text-transparent">
              QR Styler
            </span>
          </Link>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-slate-200 hover:text-amber-500"
            >
              Sign In
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              onClick={() => {
                const target = document.querySelector(".p-8");
                target?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge
          variant="outline"
          className="mb-4 text-amber-500 border-amber-500/20"
        >
          Transform Your QR Codes
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-6 tracking-tight">
          Elevate Your Brand with{" "}
          <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
            AI-Styled QR Codes
          </span>
        </h1>
        <p className="text-slate-400 text-xl mb-8 max-w-2xl mx-auto">
          Create stunning, on-brand QR codes that capture attention while
          maintaining perfect scannability. Transform ordinary QR codes into
          works of art.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
<Button
  size="lg"
  className="bg-amber-500 hover:bg-amber-600 text-slate-900 group"
  onClick={() => {
    const target = document.querySelector(".p-8");
    target?.scrollIntoView({ behavior: "smooth" });
  }}
>
  Start Creating
  <Wand2 className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
</Button>
          <Button
            size="lg"
            variant="outline"
            className="text-slate-200 hover:text-amber-500"
          >
            View Gallery
          </Button>
        </div>

        {/* Example QR Codes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {exampleQRCodes.map((qr, index) => (
            <Card
              key={index}
              className="bg-slate-900/50 border-slate-800 group hover:border-amber-500/50 transition-colors"
            >
                
<CardContent className="p-6">
    <div className="relative overflow-hidden rounded-lg" style={{width: '100%', height:'300px'}}>
        <Image
            src={qr.image}
            alt={`QR Code Example - ${qr.title}`}
          layout="fill"
            objectFit="contain"
            className="transition-transform duration-300 group-hover:scale-105 rounded-md"
            style={{ position: 'absolute'}}

        />
    </div>
    <p className="text-slate-400 mt-4 group-hover:text-amber-500 transition-colors">
        {qr.title}
    </p>
</CardContent>

    
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 group">
              <div className="bg-amber-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                <feature.icon className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-slate-200 text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

       {/* Create Section */}
<div className="max-w-3xl mx-auto">
    <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-8 flex flex-col items-center">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {status === "processing" && loading && (
                <div className="text-slate-400 mb-4">
                    Generating QR code... please wait
                </div>
            )}
            {prediction?.output && (
   <div className="relative mb-4" style={{width: '100%', height:'768px'}}>
        <Image
            src={prediction.output[prediction.output.length - 1]}
            alt="Generated QR code"
            layout="fill"
            objectFit="contain"
               style={{
                 position: "absolute"
               }}
        />
    </div>
)}
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-slate-50 mb-2">
                    Start Creating Your Styled QR Code
                </h2>
                <h3 className="text-lg text-slate-50 mb-2">
                    Style Description
                </h3>
                <a href="/api/auth/login">Login</a>
                <Textarea
                    id="prompt"
                    placeholder="Describe what you want your QR code to look like..."
                    className="bg-slate-800 border-slate-700 text-slate-200 focus:border-amber-500 resize-none mb-4"
                />
                <p className="text-slate-400 text-sm mb-6">
                    Be specific about the style, colors, and artistic elements you
                    want in your QR code
                </p>
                <div
                    className="w-full border-dashed border-2 border-slate-700 rounded-lg p-4 mb-6 cursor-pointer"
                    onClick={() => document.getElementById('image')?.click()}
                >
                    <div className="flex items-center justify-center">
                        {/* Placeholder for upload icon */}
                        <div className="w-6 h-6 text-slate-400 mr-2"></div>
                        <span className={`text-slate-400 ${fileName ? 'text-amber-500' : ''}`}>
                            {fileName || "Upload QR Code"}
                        </span>
                    </div>
                </div>
                <input type="file" id="image" className="hidden"  onChange={handleFileChange} />

                <Button
                    type="submit"
                    className="mt-4"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit"}
                </Button>
            </form>
        </CardContent>
    </Card>
</div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-amber-500" />
              <span className="text-slate-400">
                © 2024 QR Styler. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-slate-400 hover:text-amber-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-amber-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-amber-500 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
