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

interface ApiResponse {
  images: GeneratedImage[];
  pagination: PaginationInfo;
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(true); // Set to true by default to help debug
  const [rawApiResponse, setRawApiResponse] = useState<any>(null); // Store raw API response for debugging

  const checkDebugInfo = useCallback(async () => {
    try {
      const [galleryResponse, envResponse] = await Promise.all([
        fetch('/api/debug/gallery'),
        fetch('/api/debug/env')
      ]);

      const envData = await envResponse.json();
      setEnvInfo(envData);
      
      const response = galleryResponse;
      const data = await response.json();
      setDebugInfo(data);
      setShowDebug(true);

      console.log('Debug Info:', {
        env: envData,
        gallery: data
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      toast({
        title: 'Debug Check Failed',
        description: error instanceof Error ? error.message : 'Failed to get debug information',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchImages = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('UserGallery - No session user ID available');
      return; // Don't fetch if no session
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('UserGallery - Fetching images:', {
        limit: pagination.limit,
        offset: pagination.offset,
        userId: session?.user?.id,
        sessionStatus: status
      });

      const response = await fetch(
        `/api/user/images?limit=${pagination.limit}&offset=${pagination.offset}`,
        { 
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      console.log('UserGallery - Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('UserGallery - Raw response text:', responseText);

      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
        setRawApiResponse(data); // Store raw response for debugging
        console.log('UserGallery - Parsed response data:', data);
      } catch (parseError) {
        console.error('UserGallery - JSON parse error:', parseError);
        throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      console.log('UserGallery - Response data:', {
        imageCount: data.images?.length,
        pagination: data.pagination,
        firstImageUrl: data.images?.[0]?.imageUrl,
        hasImages: data.images?.length > 0,
        imageUrls: data.images?.map(img => img.imageUrl)
      });
      
      if (pagination.offset === 0) {
        console.log('UserGallery - Setting initial images:', data.images);
        setImages(data.images || []); // Ensure we handle empty arrays
      } else {
        console.log('UserGallery - Appending images:', data.images);
        setImages(prev => {
          const newImages = [...prev, ...(data.images || [])];
          console.log('UserGallery - Updated images array:', newImages);
          return newImages;
        }); // Append for pagination
      }
      setPagination(data.pagination);

      // Auto-check debug info when images are loaded
      checkDebugInfo();
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
  }, [session?.user?.id, pagination.limit, pagination.offset, status, toast, checkDebugInfo]);

  // Initial fetch on mount and when authentication status changes
  useEffect(() => {
    console.log('UserGallery - Mount/Auth effect:', {
      status,
      hasSession: !!session?.user?.id,
      refreshTrigger
    });

    if (status === 'authenticated') {
      setImages([]); // Clear existing images
      setPagination(prev => ({ ...prev, offset: 0 }));
      fetchImages();
    }
  }, [status, fetchImages, session?.user?.id, refreshTrigger]);

  // Handle refresh trigger separately
  useEffect(() => {
    console.log('UserGallery - Refresh effect:', {
      status,
      hasSession: !!session?.user?.id,
      refreshTrigger
    });

    if (status === 'authenticated' && refreshTrigger > 0) {
      setImages([]); // Clear existing images
      setPagination(prev => ({ ...prev, offset: 0 }));
      fetchImages();
    }
  }, [refreshTrigger, status, fetchImages, session?.user?.id]);

  const loadMore = useCallback(() => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    console.log('UserGallery - Loading more images:', {
      currentOffset: pagination.offset,
      limit: pagination.limit,
      hasMore: pagination.hasMore
    });

    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
    fetchImages();
  }, [loading, pagination.offset, pagination.limit, pagination.hasMore, fetchImages]);

  // Component state debug logging
  useEffect(() => {
    console.log('UserGallery - State update:', {
      imagesCount: images.length,
      loading,
      error,
      pagination,
      status,
      hasSession: !!session?.user?.id,
      firstImageUrl: images[0]?.imageUrl,
      allImageUrls: images.map(img => img.imageUrl)
    });
  }, [images.length, loading, error, pagination, status, session, images]);

  // Loading state
  if (status === 'loading') {
    console.log('UserGallery - Rendering loading state');
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-800 rounded-lg"></div>
          <div className="h-48 bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (status === 'unauthenticated') {
    console.log('UserGallery - Rendering unauthenticated state');
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
      
      {loading && images.length === 0 ? (
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
                {/* Fallback for image load errors */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <Image
                  src={image.imageUrl}
                  alt={image.prompt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={pagination.offset === 0} // Prioritize loading first page images
                  loading={pagination.offset === 0 ? "eager" : "lazy"}
                  quality={90}
                  onLoadingComplete={(img) => {
                    console.log('Image loaded successfully:', {
                      src: image.imageUrl,
                      naturalWidth: img.naturalWidth,
                      naturalHeight: img.naturalHeight,
                      id: image.id
                    });
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.error('Image Load Error:', {
                      src: img.src,
                      naturalWidth: img.naturalWidth,
                      naturalHeight: img.naturalHeight,
                      error: e
                    });
                    toast({
                      title: 'Image Load Error',
                      description: `Failed to load image: ${img.src}`,
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
                <p className="text-xs text-slate-500 mt-1">ID: {image.id}</p>
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
            className="text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Debug Information */}
      <div className="mt-8 space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={checkDebugInfo}
            variant="outline"
            size="sm"
            className="text-xs text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            Check Gallery Status
          </Button>
        </div>

        {showDebug && (
          <div className="space-y-4">
            {/* Raw API Response */}
            {rawApiResponse && (
              <div className="p-4 bg-slate-900/50 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-200">Raw API Response</h3>
                </div>
                <pre className="whitespace-pre-wrap break-all text-slate-300">
                  {JSON.stringify(rawApiResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Environment Information */}
            {envInfo && (
              <div className="p-4 bg-slate-900/50 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-200">Environment Status</h3>
                  <Button
                    onClick={() => setShowDebug(false)}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Hide
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-slate-300">
                  {JSON.stringify(envInfo, null, 2)}
                </pre>
              </div>
            )}

            {/* Gallery Debug Information */}
            {debugInfo && (
              <div className="p-4 bg-slate-900/50 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-200">Gallery Debug Information</h3>
                </div>
                <pre className="whitespace-pre-wrap break-all text-slate-300">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
