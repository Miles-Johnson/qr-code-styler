'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ImageUploadForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const prompt = formData.get('prompt') as string;

    // Validate file
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a QR code image to upload',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Invalid file type. Supported types: JPEG, PNG, WebP',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size exceeds 10MB limit',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedImage(null);

      // Create prediction
      const response = await fetch('/api/predictions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const prediction = await response.json();
      
      // Poll for the result
      const interval = setInterval(async () => {
        const pollResponse = await fetch(`/api/predictions/${prediction.id}`);
        const updatedPrediction = await pollResponse.json();

        if (updatedPrediction.status === 'succeeded') {
          clearInterval(interval);
          setGeneratedImage(updatedPrediction.storedImage?.imageUrl || updatedPrediction.output);
          toast({
            title: 'Success',
            description: 'Image generated successfully',
          });
          setIsGenerating(false);
        } else if (updatedPrediction.status === 'failed') {
          clearInterval(interval);
          setIsGenerating(false);
          throw new Error('Failed to generate image');
        }
      }, 1000);

      // Cleanup interval after 5 minutes
      setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isGenerating}
            className="cursor-pointer"
          />
        </div>
        <div>
          <Input
            type="text"
            name="prompt"
            placeholder="Enter a prompt for the image generation..."
            disabled={isGenerating}
          />
        </div>
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </Button>
      </form>

      {generatedImage && (
        <div className="relative aspect-square w-full max-w-xl mx-auto border rounded-lg overflow-hidden">
          <Image
            src={generatedImage}
            alt="Generated image"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
