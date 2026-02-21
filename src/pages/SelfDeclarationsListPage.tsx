import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelfDeclarations } from '@/hooks/useSelfDeclarations';
import { apiClient } from '@/api/client';
import type { SelfDeclarationStatus, SelfDeclaration } from '@/types/api';
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
import {
  SELF_DECLARATION_STATUS_LABELS,
  SELF_DECLARATION_STATUSES,
} from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Download } from 'lucide-react';

const EXPORT_PER_PAGE = 10000;
const SELF_DECLARATION_CSV_COLUMNS = [
  { key: 'id' as const, header: 'ID' },
  { key: 'name' as const, header: 'Name' },
  {
    key: (row: SelfDeclaration) => row.user?.email ?? '',
    header: 'Email',
  },
  {
    key: (row: SelfDeclaration) => row.secondary_member_type?.name ?? '',
    header: 'Secondary Type',
  },
  { key: 'date' as const, header: 'Date' },
  { key: 'status' as const, header: 'Status' },
  { key: 'approved_at' as const, header: 'Approved At' },
  { key: 'rejected_reason' as const, header: 'Rejected Reason' },
  { key: 'created_at' as const, header: 'Created' },
];

export function SelfDeclarationsListPage() {
  const [statusFilter, setStatusFilter] = useState<SelfDeclarationStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const { selfDeclarations, loading, error, pagination, refetch } =
    useSelfDeclarations(statusFilter, currentPage);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    selfDeclarationId: number | null;
    selfDeclarationName: string;
  }>({
    open: false,
    action: null,
    selfDeclarationId: null,
    selfDeclarationName: '',
  });

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await apiClient.approveSelfDeclaration(id);
      toast.success('Self-declaration approved successfully. Secondary member type assigned.');
      refetch();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
      setConfirmDialog({
        open: false,
        action: null,
        selfDeclarationId: null,
        selfDeclarationName: '',
      });
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await apiClient.rejectSelfDeclaration(id);
      toast.success('Self-declaration rejected successfully');
      refetch();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
      setConfirmDialog({
        open: false,
        action: null,
        selfDeclarationId: null,
        selfDeclarationName: '',
      });
    }
  };

  const openConfirmDialog = (
    action: 'approve' | 'reject',
    id: number,
    name: string
  ) => {
    setConfirmDialog({
      open: true,
      action,
      selfDeclarationId: id,
      selfDeclarationName: name,
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'approve' && confirmDialog.selfDeclarationId) {
      handleApprove(confirmDialog.selfDeclarationId);
    } else if (confirmDialog.action === 'reject' && confirmDialog.selfDeclarationId) {
      handleReject(confirmDialog.selfDeclarationId);
    }
  };

  const getStatusBadgeVariant = (status: SelfDeclarationStatus) => {
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

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const res = await apiClient.getSelfDeclarations(statusFilter, EXPORT_PER_PAGE);
      exportToCsv<SelfDeclaration>(res.data, 'self-declarations.csv', SELF_DECLARATION_CSV_COLUMNS);
      toast.success(`Exported ${res.data.length} self-declarations`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setExportLoading(false);
    }
  };

  if (loading && selfDeclarations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading self-declarations...</div>
        </div>
      </div>
    );
  }

  if (error && selfDeclarations.length === 0) {
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
          <h1 className="text-2xl xl:text-3xl font-bold">Self Declarations</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Manage and review self-declaration submissions
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
              <CardTitle>Self Declarations</CardTitle>
              <CardDescription>
                {pagination && (
                  <>
                    Showing {pagination.from} to {pagination.to} of{' '}
                    {pagination.total} self-declarations
                  </>
                )}
              </CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(
                    value === 'all' ? undefined : (value as SelfDeclarationStatus)
                  );
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {SELF_DECLARATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {SELF_DECLARATION_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selfDeclarations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No self-declarations found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selfDeclarations.map((declaration) => (
                    <TableRow key={declaration.id}>
                      <TableCell className="font-medium">{declaration.id}</TableCell>
                      <TableCell>
                        {declaration.user?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{declaration.name}</TableCell>
                      <TableCell>
                        {declaration.secondary_member_type?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(declaration.date)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(declaration.status)}>
                          {SELF_DECLARATION_STATUS_LABELS[declaration.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {declaration.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openConfirmDialog(
                                    'approve',
                                    declaration.id,
                                    declaration.name
                                  )
                                }
                                disabled={actionLoading === declaration.id}
                              >
                                {actionLoading === declaration.id
                                  ? 'Processing...'
                                  : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  openConfirmDialog(
                                    'reject',
                                    declaration.id,
                                    declaration.name
                                  )
                                }
                                disabled={actionLoading === declaration.id}
                              >
                                {actionLoading === declaration.id
                                  ? 'Processing...'
                                  : 'Reject'}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/self-declarations/${declaration.id}`}>
                              View
                            </Link>
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
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve'
                ? 'Approve Self-Declaration'
                : 'Reject Self-Declaration'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.action} the self-declaration
              for <strong>{confirmDialog.selfDeclarationName}</strong>? This action
              {confirmDialog.action === 'approve'
                ? ' will assign the secondary member type to the user.'
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
