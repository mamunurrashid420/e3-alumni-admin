import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type { Event, EventStatus } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useEvents(status?: EventStatus) {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = status ? { status } : undefined;
      const response = await apiClient.getEvents(params);
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
  }, [status]);

  return { items, loading, error, refetch: load };
}
