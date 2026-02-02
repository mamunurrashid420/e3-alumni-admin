import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type {
  ScholarshipApplication,
  ScholarshipApplicationStatus,
  PaginatedResponse,
} from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function useScholarshipApplications(
  status?: ScholarshipApplicationStatus,
  scholarshipId?: number
) {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    PaginatedResponse<ScholarshipApplication>['meta'] | null
  >(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getScholarshipApplications(
        status,
        scholarshipId
      );
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
    load();
  }, [status, scholarshipId]);

  return {
    applications,
    loading,
    error,
    pagination,
    refetch: load,
  };
}
