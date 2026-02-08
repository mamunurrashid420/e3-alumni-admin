import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type { Member, PaginatedResponse } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

interface UseBloodDonorsParams {
  search?: string;
  page?: number;
  bloodGroup?: string;
}

export function useBloodDonors({
  search,
  page = 1,
  bloodGroup,
}: UseBloodDonorsParams = {}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginatedResponse<Member>['meta'] | null>(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMembers(
        search,
        undefined,
        page,
        15,
        true,
        bloodGroup
      );
      setMembers(response.data);
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
    loadMembers();
  }, [search, page, bloodGroup]);

  return {
    members,
    loading,
    error,
    pagination,
    refetch: loadMembers,
  };
}
