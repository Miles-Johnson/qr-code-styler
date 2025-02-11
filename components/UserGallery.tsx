'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  originalQrUrl: string;
  createdAt: string;
  width: number;
  height: number;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface UserGalleryProps {
  refreshTrigger?: number;
}

export function UserGallery({ refreshTrigger = 0 }: UserGalleryProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    if (!session?.user?.id) {
      return; // Don't fetch if no session
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/user/images?limit=${pagination.limit}&offset=${pagination.offset}`,
        { 
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please sign in again.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch images');
      }

      const data = await response.json();
      
      if (pagination.offset === 0) {
        setImages(data.images || []); // Ensure we handle empty arrays
      } else {
        setImages(prev => [...prev, ...(data.images || [])]); // Append for pagination
      }
      setPagination(data.pagination);
    } catch (error) {
      console.error('Gallery fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load images');
      toast({
        title: 'Error Loading Images',
        description: error instanceof Error ? error.message : 'Failed to load images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      // Reset images and pagination when refreshing
      if (refreshTrigger > 0) {
        setImages([]);
        setPagination(prev => ({ ...prev, offset: 0 }));
      }
      fetchImages();
    }
  }, [status, refreshTrigger]); // Fetch on authentication status change or refresh trigger

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
    fetchImages();
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-lg font-semibold">Please sign in to view your generated images.</p>
        <p className="text-sm text-gray-600">Your gallery will be available after signing in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Your Generated Images</h2>
      
      {loading && images.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-lg text-red-600">Error loading images</p>
          <Button 
            onClick={() => {
              setError(null);
              fetchImages();
            }}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-lg">No images generated yet.</p>
          <p className="text-sm text-gray-600">Create your first QR code to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.imageUrl}
                  alt={image.prompt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={pagination.offset === 0} // Prioritize loading first page images
                  loading={pagination.offset === 0 ? "eager" : "lazy"}
                  quality={90}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    toast({
                      title: 'Image Load Error',
                      description: 'Failed to load image. Please try refreshing.',
                      variant: 'destructive',
                    });
                  }}
                />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm line-clamp-2">{image.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.hasMore && !loading && !error && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
