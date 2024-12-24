"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Wand2, Zap, Shield, Eye, Palette } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

// Extract feature data for better maintainability
const features = [
  {
    icon: Palette,
    title: "Brand Matching",
    description: "Perfect integration with your brand's visual identity"
  },
  {
    icon: Eye,
    title: "Enhanced Visibility",
    description: "Improved scannability at any size while maintaining style"
  },
  {
    icon: Shield,
    title: "Future-Proof",
    description: "Dynamic URL capability for long-term flexibility"
  }
]

// Extract example QR codes data
const exampleQRCodes = [
  {
    title: "Modern Minimalist",
    image: "https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Artistic Blend",
    image: "https://images.unsplash.com/photo-1590845947600-2d83969e7bb4?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Brand Integration",
    image: "https://images.unsplash.com/photo-1590845947676-fa2576fb3ac7?w=800&auto=format&fit=crop&q=60"
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <QrCode className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-amber-500 bg-clip-text text-transparent">
              QR Styler
            </span>
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-slate-200 hover:text-amber-500">
              Sign In
            </Button>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                    onClick={() => {
                      const target = document.querySelector(".p-8")
                      target?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    Get Started
                  </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="outline" className="mb-4 text-amber-500 border-amber-500/20">
          Transform Your QR Codes
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-6 tracking-tight">
          Elevate Your Brand with{" "}
          <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
            AI-Styled QR Codes
          </span>
        </h1>
        <p className="text-slate-400 text-xl mb-8 max-w-2xl mx-auto">
          Create stunning, on-brand QR codes that capture attention while maintaining perfect
          scannability. Transform ordinary QR codes into works of art.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 group">
            Start Creating
            <Wand2 className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="text-slate-200 hover:text-amber-500">
            View Gallery
          </Button>
        </div>

        {/* Example QR Codes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {exampleQRCodes.map((qr, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-800 group hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={qr.image}
                    alt={`QR Code Example - ${qr.title}`}
                    width={300}
                    height={300}
                    className="w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="text-slate-400 mt-4 group-hover:text-amber-500 transition-colors">{qr.title}</p>
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
              <h3 className="text-slate-200 text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Create Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-50 mb-6">
                Start Creating Your Styled QR Code
              </h2>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter your URL"
                      className="bg-slate-800 border-slate-700 text-slate-200 focus:border-amber-500"
                    />
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 group">
                      Generate QR Code
                      <Zap className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="text">
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter your text"
                      className="bg-slate-800 border-slate-700 text-slate-200 focus:border-amber-500"
                    />
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 group">
                      Generate QR Code
                      <Zap className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
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
              <span className="text-slate-400">© 2024 QR Styler. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-400 hover:text-amber-500 transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-slate-400 hover:text-amber-500 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-slate-400 hover:text-amber-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
