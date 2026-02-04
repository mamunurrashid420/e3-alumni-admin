import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScholarshipApplications } from '@/hooks/useScholarshipApplications';
import type { ScholarshipApplicationStatus } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SCHOLARSHIP_STATUSES: ScholarshipApplicationStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
];

export function ScholarshipApplicationsListPage() {
  const [statusFilter, setStatusFilter] = useState<
    ScholarshipApplicationStatus | undefined
  >('PENDING');
  const {
    applications,
    loading,
    error,
    pagination,
    refetch,
  } = useScholarshipApplications(statusFilter);

  const getStatusBadgeVariant = (status: ScholarshipApplicationStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading scholarship applications...</div>
        </div>
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold">Scholarship Applications</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Review and manage scholarship applications
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Applications</CardTitle>
              <CardDescription>
                {pagination && (
                  <>
                    Showing {pagination.from} to {pagination.to} of{' '}
                    {pagination.total} applications
                  </>
                )}
              </CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) =>
                  setStatusFilter(
                    value === 'all' ? undefined : (value as ScholarshipApplicationStatus)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {SCHOLARSHIP_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No scholarship applications found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Scholarship</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.id}</TableCell>
                      <TableCell className="font-medium">
                        {app.applicant_name}
                      </TableCell>
                      <TableCell>
                        {app.scholarship?.title ?? `#${app.scholarship_id}`}
                      </TableCell>
                      <TableCell>{app.applicant_phone}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {STATUS_LABELS[app.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(app.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/scholarship-applications/${app.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
