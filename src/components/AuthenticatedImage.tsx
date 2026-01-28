import { useState, useEffect } from 'react';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

/**
 * Component that fetches images with authentication headers
 * and displays them using blob URLs
 */
export function AuthenticatedImage({ src, alt, className, onError }: AuthenticatedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    // Check if it's already a blob URL or data URL
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      setImageSrc(src);
      setLoading(false);
      return;
    }

    // Fetch image with authentication
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No authentication token');
        }

        // Get API base URL from environment or use default
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        
        // Construct full URL if src is relative or doesn't include the base URL
        let imageUrl = src;
        if (src.startsWith('/')) {
          // Relative URL - prepend base URL
          imageUrl = `${apiBaseUrl}${src}`;
        } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
          // Relative URL without leading slash
          imageUrl = `${apiBaseUrl}/${src}`;
        }
        // If src already includes http:// or https://, use it as-is

        const response = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageSrc(blobUrl);
      } catch (err) {
        console.error('Error loading authenticated image:', err);
        setError(true);
        if (onError) {
          onError();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Cleanup blob URL on unmount or src change
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]); // Removed onError from dependencies to avoid unnecessary re-renders

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
}
