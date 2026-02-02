import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type { Event, EventRegistration } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useEvent(id: number | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
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

  const loadRegistrations = async () => {
    if (id == null) return;
    try {
      const response = await apiClient.getEventRegistrations(id);
      setRegistrations(response.data);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  useEffect(() => {
    if (id != null) {
      loadEvent();
      loadRegistrations();
    } else {
      setEvent(null);
      setRegistrations([]);
      setLoading(false);
    }
  }, [id]);

  return {
    event,
    registrations,
    loading,
    error,
    refetchEvent: loadEvent,
    refetchRegistrations: loadRegistrations,
  };
}
