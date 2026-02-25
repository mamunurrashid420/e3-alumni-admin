import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';
import type { EventRegistration, PaginatedResponse } from '@/types/api';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { exportToCsv, type CsvColumn } from '@/lib/exportCsv';
import { formatDateTime } from '@/lib/format';

const REGISTRATIONS_PER_PAGE = 15;

export function useEventRegistrations(eventId: number | null, page: number = 1) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] =
    useState<PaginatedResponse<EventRegistration>['meta'] | null>(null);

  const loadRegistrations = useCallback(async () => {
    if (eventId == null) return;
    try {
      setLoading(true);
      const response = await apiClient.getEventRegistrations(eventId, {
        page,
        per_page: REGISTRATIONS_PER_PAGE,
      });
      setRegistrations(response.data);
      setPagination(response.meta);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [eventId, page]);

  useEffect(() => {
    if (eventId != null) {
      loadRegistrations();
    } else {
      setRegistrations([]);
      setPagination(null);
      setLoading(false);
    }
  }, [eventId, page, loadRegistrations]);

  const exportAll = useCallback(
    async (eventTitle: string) => {
      if (eventId == null) return;
      try {
        const { data } = await apiClient.getEventRegistrationsAll(eventId);
        const columns: CsvColumn<EventRegistration>[] = [
          { key: (r) => r.name ?? r.user?.name ?? '', header: 'Name' },
          { key: (r) => r.user?.member_id ?? '', header: 'Member ID' },
          { key: (r) => r.user?.email ?? '', header: 'Email' },
          { key: (r) => r.phone ?? r.user?.phone ?? '', header: 'Phone' },
          { key: 'address', header: 'Address' },
          { key: 'ssc_jsc', header: 'SSC Batch' },
          { key: 'guest_count', header: 'Guests' },
          { key: 'guest_details', header: 'Guest details' },
          { key: 'participant_fee', header: 'Fee' },
          { key: 'total_fees', header: 'Total fees' },
          { key: 'payment_document_url', header: 'Payment URL' },
          { key: 'notes', header: 'Notes' },
          { key: (r) => formatDateTime(r.registered_at), header: 'Registered at' },
        ];
        const slug = eventTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'event';
        exportToCsv(data, `event-${slug}-registrations.csv`, columns);
        toast.success(`Exported ${data.length} registration(s).`);
      } catch (err) {
        toast.error(handleApiError(err));
      }
    },
    [eventId]
  );

  return {
    registrations,
    loading,
    pagination,
    refetch: loadRegistrations,
    exportAll,
  };
}
