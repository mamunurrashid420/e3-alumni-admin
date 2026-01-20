import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type {
  Payment,
  PaymentStatus,
  PaginatedResponse,
} from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function usePayments(status?: PaymentStatus) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Payment>['meta'] | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPayments(status);
      setPayments(response.data);
      setPagination(response.meta);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [status]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: loadPayments,
  };
}
