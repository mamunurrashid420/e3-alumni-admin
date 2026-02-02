import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type { HonorBoardEntry, HonorBoardRole } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useHonorBoard(role?: HonorBoardRole) {
  const [items, setItems] = useState<HonorBoardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getHonorBoard(role);
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
  }, [role]);

  return { items, loading, error, refetch: load };
}
