import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type {
  MembershipApplication,
  ApplicationStatus,
  PaginatedResponse,
} from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useApplications(status?: ApplicationStatus) {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<MembershipApplication>['meta'] | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getApplications(status);
      setApplications(response.data);
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
    loadApplications();
  }, [status]);

  return {
    applications,
    loading,
    error,
    pagination,
    refetch: loadApplications,
  };
}
