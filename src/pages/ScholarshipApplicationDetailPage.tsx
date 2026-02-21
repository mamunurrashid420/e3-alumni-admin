import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { ScholarshipApplication } from '@/types/api';
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
import { STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function ScholarshipApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ScholarshipApplication | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
  }>({ open: false, action: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getScholarshipApplication(Number(id));
      setApplication(response.data);
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
      await apiClient.approveScholarshipApplication(Number(id));
      toast.success('Application approved successfully');
      loadApplication();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await apiClient.rejectScholarshipApplication(Number(id), rejectReason);
      toast.success('Application rejected successfully');
      loadApplication();
      setRejectReason('');
    } catch (err) {
      toast.error(handleApiError(err));
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
          <div className="text-lg">Loading application details...</div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error || 'Application not found'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/scholarship-applications')}>
              Back to List
            </Button>
            <Button variant="outline" onClick={loadApplication}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold">Scholarship Application #{application.id}</h1>
          <p className="text-gray-600 mt-1">
            <Link
              to="/scholarship-applications"
              className="text-blue-600 hover:underline"
            >
              ← Back to applications
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={getStatusBadgeVariant(application.status)}>
            {STATUS_LABELS[application.status]}
          </Badge>
          {application.status === 'PENDING' && (
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
        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-base">{application.applicant_name}</p>
            </div>
            {application.applicant_email && (
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{application.applicant_email}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-base">{application.applicant_phone}</p>
            </div>
            {application.applicant_address && (
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base">{application.applicant_address}</p>
              </div>
            )}
            {application.class_or_grade && (
              <div>
                <p className="text-sm font-medium text-gray-500">Class / Grade</p>
                <p className="text-base">{application.class_or_grade}</p>
              </div>
            )}
            {application.school_name && (
              <div>
                <p className="text-sm font-medium text-gray-500">School</p>
                <p className="text-base">{application.school_name}</p>
              </div>
            )}
            {application.parent_or_guardian_name && (
              <div>
                <p className="text-sm font-medium text-gray-500">Parent / Guardian</p>
                <p className="text-base">{application.parent_or_guardian_name}</p>
              </div>
            )}
            {application.statement && (
              <div>
                <p className="text-sm font-medium text-gray-500">Statement</p>
                <p className="text-base whitespace-pre-wrap">{application.statement}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scholarship & Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Scholarship</p>
              <p className="text-base">
                {application.scholarship?.title ?? `#${application.scholarship_id}`}
              </p>
              {application.scholarship?.category && (
                <p className="text-sm text-gray-600">{application.scholarship.category}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Applied at</p>
              <p className="text-base">{formatDate(application.created_at)}</p>
            </div>
            {application.academic_proof_file && (
              <div>
                <p className="text-sm font-medium text-gray-500">Academic proof</p>
                <a
                  href={application.academic_proof_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View file
                </a>
              </div>
            )}
            {application.other_document_file && (
              <div>
                <p className="text-sm font-medium text-gray-500">Other document</p>
                <a
                  href={application.other_document_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View file
                </a>
              </div>
            )}
            {application.applicant_signature && (
              <div>
                <p className="text-sm font-medium text-gray-500">Applicant signature</p>
                <a
                  href={application.applicant_signature}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View file
                </a>
              </div>
            )}
            {application.status === 'REJECTED' && application.rejected_reason && (
              <div>
                <p className="text-sm font-medium text-gray-500">Rejection reason</p>
                <p className="text-base">{application.rejected_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={confirmDialog.open && confirmDialog.action === 'approve'}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this scholarship application?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmDialog.open && confirmDialog.action === 'reject'}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, action: null });
            setRejectReason('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject application</AlertDialogTitle>
            <AlertDialogDescription>
              Optionally provide a reason for rejection. The applicant may see this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Rejection reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
