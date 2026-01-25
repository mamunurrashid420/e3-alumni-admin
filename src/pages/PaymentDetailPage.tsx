import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { Payment } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  PAYMENT_STATUS_LABELS,
  PAYMENT_PURPOSE_LABELS,
} from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { AuthenticatedImage } from '@/components/AuthenticatedImage';

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
  }>({
    open: false,
    action: null,
  });

  useEffect(() => {
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPayment(Number(id));
      setPayment(response.data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await apiClient.approvePayment(Number(id));
      toast.success('Payment approved successfully');
      loadPayment();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await apiClient.rejectPayment(Number(id));
      toast.success('Payment rejected successfully');
      loadPayment();
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading payment details...</div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error || 'Payment not found'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/payments')}>Back to List</Button>
            <Button variant="outline" onClick={loadPayment}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment #{payment.id}</h1>
          <p className="text-gray-600 mt-1">
            <Link to="/payments" className="text-blue-600 hover:underline">
              ← Back to payments
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={getStatusBadgeVariant(payment.status)}>
            {PAYMENT_STATUS_LABELS[payment.status]}
          </Badge>
          {payment.status === 'PENDING' && (
            <div className="flex gap-2">
              <Button
                onClick={() => setConfirmDialog({ open: true, action: 'approve' })}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDialog({ open: true, action: 'reject' })}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Purpose</p>
              <p className="text-base">
                {PAYMENT_PURPOSE_LABELS[payment.payment_purpose]}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Amount</p>
              <p className="text-base font-semibold text-green-600">
                {formatCurrency(payment.payment_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={getStatusBadgeVariant(payment.status)}>
                {PAYMENT_STATUS_LABELS[payment.status]}
              </Badge>
            </div>
            {payment.payment_proof_file && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Payment Proof</p>
                <AuthenticatedImage
                  src={payment.payment_proof_file}
                  alt="Payment Proof"
                  className="max-w-full h-auto rounded-lg border border-gray-200 max-h-[400px] object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Information */}
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.member_id && (
              <div>
                <p className="text-sm font-medium text-gray-500">Member ID</p>
                <p className="text-base">{payment.member_id}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-base">{payment.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-base whitespace-pre-wrap">{payment.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mobile Number</p>
              <p className="text-base">{payment.mobile_number}</p>
            </div>
          </CardContent>
        </Card>

        {/* Approval Information */}
        {(payment.approved_by || payment.approved_at) && (
          <Card>
            <CardHeader>
              <CardTitle>Approval Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment.approved_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved At</p>
                  <p className="text-base">{formatDate(payment.approved_at)}</p>
                </div>
              )}
              {payment.approved_by && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved By</p>
                  <p className="text-base">User ID: {payment.approved_by}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-base">{formatDate(payment.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="text-base">{formatDate(payment.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
              Are you sure you want to {confirmDialog.action} this payment
              for <strong>{payment.name}</strong>? This action
              {confirmDialog.action === 'approve'
                ? ' will mark the payment as approved.'
                : ' cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.action === 'approve' ? handleApprove : handleReject}
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
