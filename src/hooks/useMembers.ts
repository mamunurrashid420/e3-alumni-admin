import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import type { Member, MembershipType, PaginatedResponse } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

interface UseMembersParams {
  search?: string;
  primaryMemberType?: MembershipType;
  page?: number;
}

export function useMembers({
  search,
  primaryMemberType,
  page = 1,
}: UseMembersParams = {}) {
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
        primaryMemberType,
        page
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
  }, [search, primaryMemberType, page]);

  return {
    members,
    loading,
    error,
    pagination,
    refetch: loadMembers,
  };
}
