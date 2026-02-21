import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePayments } from '@/hooks/usePayments';
import { apiClient } from '@/api/client';
import type { PaymentStatus, Payment } from '@/types/api';
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
import { PAYMENT_STATUS_LABELS, PAYMENT_PURPOSE_LABELS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/format';
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
const PAYMENT_CSV_COLUMNS = [
  { key: 'id' as const, header: 'ID' },
  { key: 'member_id' as const, header: 'Member ID' },
  { key: 'name' as const, header: 'Name' },
  { key: 'address' as const, header: 'Address' },
  { key: 'mobile_number' as const, header: 'Mobile' },
  { key: 'payment_purpose' as const, header: 'Purpose' },
  { key: 'payment_amount' as const, header: 'Amount' },
  { key: 'status' as const, header: 'Status' },
  { key: 'approved_at' as const, header: 'Approved At' },
  { key: 'created_at' as const, header: 'Created' },
];

export function PaymentsListPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const { payments, loading, error, pagination, refetch } = usePayments(
    statusFilter,
    currentPage
  );
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    paymentId: number | null;
    paymentName: string;
  }>({
    open: false,
    action: null,
    paymentId: null,
    paymentName: '',
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await apiClient.approvePayment(id);
      toast.success('Payment approved successfully');
      refetch();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, paymentId: null, paymentName: '' });
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await apiClient.rejectPayment(id);
      toast.success('Payment rejected successfully');
      refetch();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, paymentId: null, paymentName: '' });
    }
  };

  const openConfirmDialog = (
    action: 'approve' | 'reject',
    id: number,
    name: string
  ) => {
    if (isMobile) {
      // Use browser confirm on mobile
      const actionText = action === 'approve' ? 'approve' : 'reject';
      const message = `Are you sure you want to ${actionText} the payment for ${name}?${
        action === 'reject' ? ' This action cannot be undone.' : ''
      }`;
      
      if (window.confirm(message)) {
        if (action === 'approve') {
          handleApprove(id);
        } else {
          handleReject(id);
        }
      }
    } else {
      // Use AlertDialog on desktop
      setConfirmDialog({
        open: true,
        action,
        paymentId: id,
        paymentName: name,
      });
    }
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'approve' && confirmDialog.paymentId) {
      handleApprove(confirmDialog.paymentId);
    } else if (confirmDialog.action === 'reject' && confirmDialog.paymentId) {
      handleReject(confirmDialog.paymentId);
    }
  };

  const getStatusBadgeVariant = (status: PaymentStatus) => {
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
      const res = await apiClient.getPayments(statusFilter, EXPORT_PER_PAGE);
      exportToCsv<Payment>(res.data, 'payments.csv', PAYMENT_CSV_COLUMNS);
      toast.success(`Exported ${res.data.length} payments`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setExportLoading(false);
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading payments...</div>
        </div>
      </div>
    );
  }

  if (error && payments.length === 0) {
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
          <h1 className="text-2xl xl:text-3xl font-bold">Payments</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Manage and review payment submissions
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
              <CardTitle>Payments</CardTitle>
              <CardDescription>
                {pagination && (
                  <>
                    Showing {pagination.from} to {pagination.to} of{' '}
                    {pagination.total} payments
                  </>
                )}
              </CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? undefined : (value as PaymentStatus));
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
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.member_id || 'N/A'}</TableCell>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell>
                        {PAYMENT_PURPOSE_LABELS[payment.payment_purpose]}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.payment_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {PAYMENT_STATUS_LABELS[payment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  openConfirmDialog('approve', payment.id, payment.name)
                                }
                                disabled={actionLoading === payment.id}
                              >
                                {actionLoading === payment.id ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  openConfirmDialog('reject', payment.id, payment.name)
                                }
                                disabled={actionLoading === payment.id}
                              >
                                {actionLoading === payment.id ? 'Processing...' : 'Reject'}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/payments/${payment.id}`}>View</Link>
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

      {!isMobile && (
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
          setConfirmDialog(prev => ({ ...prev, open }))
        }>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.action === 'approve'
                  ? 'Approve Payment'
                  : 'Reject Payment'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {confirmDialog.action} the payment
                for <strong>{confirmDialog.paymentName}</strong>? This action
                {confirmDialog.action === 'approve'
                  ? ' will mark the payment as approved.'
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
      )}
    </div>
  );
}
