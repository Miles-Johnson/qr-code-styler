'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  width: number;
  height: number;
}

interface UserGalleryProps {
  refreshTrigger?: number;
}

export function UserGallery({ refreshTrigger = 0 }: UserGalleryProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('UserGallery - No session user ID available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/images', { 
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Gallery fetch error:', error);
      setError('Failed to load images');
      toast({
        title: 'Error Loading Images',
        description: 'Failed to load images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, toast]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchImages();
    }
  }, [status, fetchImages, refreshTrigger]);

  if (status === 'loading') {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-800 rounded-lg"></div>
          <div className="h-48 bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-lg font-semibold text-slate-200">Please sign in to view your generated images.</p>
        <p className="text-sm text-slate-400">Your gallery will be available after signing in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-200">Your Generated Images</h2>
        <p className="text-sm text-slate-400">
          {images.length} image{images.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-slate-800 rounded-lg"></div>
            <div className="h-48 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-lg text-red-400">Error loading images</p>
          <Button 
            onClick={fetchImages}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-lg text-slate-200">No images generated yet.</p>
          <p className="text-sm text-slate-400">Create your first QR code to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative bg-slate-900/50 rounded-lg shadow-md overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-colors"
            >
              <div className="relative aspect-square bg-slate-800">
                <Image
                  src={image.imageUrl}
                  alt={image.prompt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={false}
                  loading="lazy"
                  quality={90}
                  onError={() => {
                    toast({
                      title: 'Image Load Error',
                      description: `Failed to load image: ${image.imageUrl}`,
                      variant: 'destructive',
                    });
                  }}
                />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-slate-400">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-200 line-clamp-2">{image.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
