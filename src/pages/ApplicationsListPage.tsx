import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApplications } from '@/hooks/useApplications';
import { apiClient } from '@/api/client';
import type { ApplicationStatus, MembershipApplication } from '@/types/api';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/exportCsv';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pagination } from '@/components/ui/pagination';
import { STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

const EXPORT_PER_PAGE = 10000;
const APPLICATION_CSV_COLUMNS = [
  { key: 'id' as const, header: 'ID' },
  { key: 'full_name' as const, header: 'Name' },
  { key: 'email' as const, header: 'Email' },
  { key: 'membership_type' as const, header: 'Type' },
  { key: 'status' as const, header: 'Status' },
  { key: 'created_at' as const, header: 'Created' },
];
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ApplicationsListPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | undefined>('PENDING');
  const [currentPage, setCurrentPage] = useState(1);
  const { applications, loading, error, pagination, refetch } = useApplications(
    statusFilter,
    currentPage
  );
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    applicationId: number | null;
    applicationName: string;
  }>({
    open: false,
    action: null,
    applicationId: null,
    applicationName: '',
  });

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const res = await apiClient.getApplications(statusFilter, EXPORT_PER_PAGE);
      exportToCsv<MembershipApplication>(
        res.data,
        'membership-applications.csv',
        APPLICATION_CSV_COLUMNS
      );
      toast.success(`Exported ${res.data.length} applications`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setExportLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const response = await apiClient.approveApplication(id);
      toast.success(
        `Application approved! User created with member ID: ${response.user.member_id}`
      );
      refetch();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, applicationId: null, applicationName: '' });
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await apiClient.rejectApplication(id);
      toast.success('Application rejected successfully');
      refetch();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, applicationId: null, applicationName: '' });
    }
  };

  const isMobileViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  const openConfirmDialog = (
    action: 'approve' | 'reject',
    id: number,
    name: string
  ) => {
    if (isMobileViewport()) {
      const msg =
        action === 'approve'
          ? `Approve application for ${name}? This will create a user account and send credentials via email.`
          : `Reject application for ${name}? This cannot be undone.`;
      if (window.confirm(msg)) {
        if (action === 'approve') handleApprove(id);
        else handleReject(id);
      }
    } else {
      setConfirmDialog({
        open: true,
        action,
        applicationId: id,
        applicationName: name,
      });
    }
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'approve' && confirmDialog.applicationId) {
      handleApprove(confirmDialog.applicationId);
    } else if (confirmDialog.action === 'reject' && confirmDialog.applicationId) {
      handleReject(confirmDialog.applicationId);
    }
  };

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
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
          <div className="text-lg">Loading applications...</div>
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
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold">Membership Applications</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Manage and review membership applications
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCsv}
          disabled={exportLoading}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {exportLoading ? 'Exporting...' : 'Export CSV'}
        </Button>
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
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? undefined : (value as ApplicationStatus));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No applications found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>{app.full_name}</TableCell>
                      <TableCell>{app.email || 'N/A'}</TableCell>
                      <TableCell>{app.membership_type}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {STATUS_LABELS[app.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(app.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openConfirmDialog('approve', app.id, app.full_name)
                                }
                                disabled={actionLoading === app.id}
                              >
                                {actionLoading === app.id ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  openConfirmDialog('reject', app.id, app.full_name)
                                }
                                disabled={actionLoading === app.id}
                              >
                                {actionLoading === app.id ? 'Processing...' : 'Reject'}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/applications/${app.id}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="mt-4">
              <Pagination
                pagination={pagination}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve'
                ? 'Approve Application'
                : 'Reject Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.action} the application
              for <strong>{confirmDialog.applicationName}</strong>? This action
              {confirmDialog.action === 'approve'
                ? ' will create a user account and send credentials via email.'
                : ' cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmDialog.action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
