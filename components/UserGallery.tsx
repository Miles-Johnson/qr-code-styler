'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        api.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        api.scrollNext();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [api]);

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
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="relative bg-slate-900/50 rounded-lg shadow-md overflow-hidden border border-slate-800">
                  <div className="aspect-square bg-slate-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
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
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="relative bg-slate-900/50 rounded-lg shadow-md overflow-hidden border border-slate-800">
                  <div className="aspect-square bg-slate-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
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
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-12">
          <div className="relative w-full">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 1,
                containScroll: "trimSnaps"
              }}
              setApi={setApi}
              className="w-full relative group select-none touch-pan-y"
            >
              <CarouselContent className="cursor-grab active:cursor-grabbing">
                {images.map((image) => (
                  <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3 pl-4 transition-opacity duration-300 ease-in-out">
                  <div className="relative bg-slate-900/50 rounded-lg shadow-md overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-[1.02]">
                    <div className="relative aspect-square bg-slate-800">
                      <Image
                        src={image.imageUrl}
                        alt={image.prompt}
                        fill
                        className="object-contain"
                        sizes="33vw"
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
                </CarouselItem>
              ))}
              </CarouselContent>
            </Carousel>
            
            <button 
              onClick={() => api?.scrollPrev()}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 hover:bg-slate-900/75 border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-8 w-8 text-slate-200" />
            </button>
            
            <button 
              onClick={() => api?.scrollNext()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 hover:bg-slate-900/75 border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Next slide"
            >
              <ChevronRight className="h-8 w-8 text-slate-200" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
