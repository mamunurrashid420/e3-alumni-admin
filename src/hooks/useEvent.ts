import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type { Event } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useEvent(id: number | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = async () => {
    if (id == null) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getEvent(id);
      setEvent(response.data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id != null) {
      loadEvent();
    } else {
      setEvent(null);
      setLoading(false);
    }
  }, [id]);

  return {
    event,
    loading,
    error,
    refetchEvent: loadEvent,
  };
}
