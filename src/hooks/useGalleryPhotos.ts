import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type { GalleryPhoto } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useGalleryPhotos(category?: string) {
  const [items, setItems] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getGalleryPhotos(
        category ? { category } : undefined
      );
      setItems(response.data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category]);

  return { items, loading, error, refetch: load };
}
