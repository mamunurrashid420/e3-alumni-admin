import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePayments } from '@/hooks/usePayments';
import { apiClient } from '@/api/client';
import type { PaymentStatus } from '@/types/api';
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

export function PaymentsListPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>();
  const { payments, loading, error, pagination, refetch } = usePayments(statusFilter);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
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
    setConfirmDialog({
      open: true,
      action,
      paymentId: id,
      paymentName: name,
    });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-600 mt-1">
            Manage and review payment submissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <div className="w-48">
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) =>
                  setStatusFilter(value === 'all' ? undefined : (value as PaymentStatus))
                }
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
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.last_page}
              </div>
              <div className="flex gap-2">
                {pagination.current_page > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement pagination navigation
                      toast.info('Pagination navigation coming soon');
                    }}
                  >
                    Previous
                  </Button>
                )}
                {pagination.current_page < pagination.last_page && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement pagination navigation
                      toast.info('Pagination navigation coming soon');
                    }}
                  >
                    Next
                  </Button>
                )}
              </div>
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
    </div>
  );
}
