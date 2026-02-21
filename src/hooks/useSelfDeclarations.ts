import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type {
  SelfDeclaration,
  SelfDeclarationStatus,
  PaginatedResponse,
} from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useSelfDeclarations(statusFilter?: SelfDeclarationStatus, page: number = 1) {
  const [selfDeclarations, setSelfDeclarations] = useState<SelfDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<SelfDeclaration>['meta'] | null>(null);

  const fetchSelfDeclarations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getSelfDeclarations(statusFilter, undefined, page);
      setSelfDeclarations(response.data);
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
    fetchSelfDeclarations();
  }, [statusFilter, page]);

  return {
    selfDeclarations,
    loading,
    error,
    pagination,
    refetch: fetchSelfDeclarations,
  };
}
