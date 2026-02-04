import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function usePaymentsSummary() {
  const [totalApprovedAmount, setTotalApprovedAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getPaymentsSummary();
        if (!cancelled) {
          setTotalApprovedAmount(data.total_approved_amount);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = handleApiError(err);
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    totalApprovedAmount,
    loading,
    error,
  };
}
