import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthenticatedImage } from '@/components/AuthenticatedImage';
import { apiClient } from '@/api/client';
import type { MembershipApplication } from '@/types/api';
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
  STATUS_LABELS,
  MEMBERSHIP_TYPE_LABELS,
  GENDER_LABELS,
} from '@/lib/constants';
import { formatDate, formatCurrency, formatPhoneNumber } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<MembershipApplication | null>(null);
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
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getApplication(Number(id));
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
      const response = await apiClient.approveApplication(Number(id));
      toast.success(
        `Application approved! User created with member ID: ${response.user.member_id}`
      );
      loadApplication();
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
      await apiClient.rejectApplication(Number(id));
      toast.success('Application rejected successfully');
      loadApplication();
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
            <Button onClick={() => navigate('/applications')}>Back to List</Button>
            <Button variant="outline" onClick={loadApplication}>
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
          <h1 className="text-3xl font-bold">Application #{application.id}</h1>
          <p className="text-gray-600 mt-1">
            <Link to="/applications" className="text-blue-600 hover:underline">
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
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-base">{application.full_name}</p>
            </div>
            {application.name_bangla && (
              <div>
                <p className="text-sm font-medium text-gray-500">Name (Bangla)</p>
                <p className="text-base">{application.name_bangla}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-base">
                {application.gender ? GENDER_LABELS[application.gender] : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base">{application.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mobile Number</p>
              <p className="text-base">{formatPhoneNumber(application.mobile_number)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Blood Group</p>
              <p className="text-base">{application.blood_group || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">T-Shirt Size</p>
              <p className="text-base">{application.t_shirt_size || 'N/A'}</p>
            </div>
            {application.photo && (
              <div>
                <p className="text-sm font-medium text-gray-500">Photo</p>
                <div className="mt-2">
                  <AuthenticatedImage
                    src={application.photo}
                    alt="Photo"
                    className="max-w-xs h-auto rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
            {application.signature && (
              <div>
                <p className="text-sm font-medium text-gray-500">Signature</p>
                <div className="mt-2">
                  <AuthenticatedImage
                    src={application.signature}
                    alt="Signature"
                    className="max-w-xs h-auto rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family Information */}
        <Card>
          <CardHeader>
            <CardTitle>Family Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.father_name && (
              <div>
                <p className="text-sm font-medium text-gray-500">Father's Name</p>
                <p className="text-base">{application.father_name}</p>
              </div>
            )}
            {application.mother_name && (
              <div>
                <p className="text-sm font-medium text-gray-500">Mother's Name</p>
                <p className="text-base">{application.mother_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Educational Information */}
        <Card>
          <CardHeader>
            <CardTitle>Educational Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.jsc_year && (
              <div>
                <p className="text-sm font-medium text-gray-500">JSC Year</p>
                <p className="text-base">{application.jsc_year}</p>
              </div>
            )}
            {application.ssc_year && (
              <div>
                <p className="text-sm font-medium text-gray-500">SSC Year</p>
                <p className="text-base">{application.ssc_year}</p>
              </div>
            )}
            {application.highest_educational_degree && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Highest Educational Degree
                </p>
                <p className="text-base">{application.highest_educational_degree}</p>
              </div>
            )}
            {application.studentship_proof_type && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Studentship Proof Type
                </p>
                <p className="text-base">{application.studentship_proof_type}</p>
              </div>
            )}
            {application.studentship_proof_file && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Studentship Proof File
                </p>
                <div className="mt-2">
                  <AuthenticatedImage
                    src={application.studentship_proof_file}
                    alt="Studentship Proof"
                    className="max-w-md h-auto rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.present_address && (
              <div>
                <p className="text-sm font-medium text-gray-500">Present Address</p>
                <p className="text-base">{application.present_address}</p>
              </div>
            )}
            {application.permanent_address && (
              <div>
                <p className="text-sm font-medium text-gray-500">Permanent Address</p>
                <p className="text-base">{application.permanent_address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.profession && (
              <div>
                <p className="text-sm font-medium text-gray-500">Profession</p>
                <p className="text-base">{application.profession}</p>
              </div>
            )}
            {application.designation && (
              <div>
                <p className="text-sm font-medium text-gray-500">Designation</p>
                <p className="text-base">{application.designation}</p>
              </div>
            )}
            {application.institute_name && (
              <div>
                <p className="text-sm font-medium text-gray-500">Institute Name</p>
                <p className="text-base">{application.institute_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership & Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Membership & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Membership Type</p>
              <p className="text-base">
                {MEMBERSHIP_TYPE_LABELS[application.membership_type]}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Entry Fee</p>
              <p className="text-base">
                {formatCurrency(application.entry_fee)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Yearly Fee</p>
              <p className="text-base">{formatCurrency(application.yearly_fee)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Years</p>
              <p className="text-base">
                {typeof application.payment_years === 'string' &&
                application.payment_years.toLowerCase() === 'lifetime'
                  ? 'Lifetime'
                  : application.payment_years}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500">Membership Fee</p>
              <p className="text-base">
                {typeof application.payment_years === 'string' &&
                application.payment_years.toLowerCase() === 'lifetime' ? (
                  <>
                    {formatCurrency(application.yearly_fee)} (Lifetime)
                  </>
                ) : (
                  <>
                    {formatCurrency(application.yearly_fee)} × {application.payment_years} ={' '}
                    {formatCurrency(application.total_paid_amount)}
                  </>
                )}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500">Total Paid Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(application.total_paid_amount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Entry fee is shown separately and not included in this total)
              </p>
            </div>
            {application.receipt_file && (
              <div>
                <p className="text-sm font-medium text-gray-500">Receipt File</p>
                <div className="mt-2">
                  <AuthenticatedImage
                    src={application.receipt_file}
                    alt="Receipt"
                    className="max-w-md h-auto rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={getStatusBadgeVariant(application.status)}>
                {STATUS_LABELS[application.status]}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-base">{formatDate(application.created_at)}</p>
            </div>
            {application.approved_at && (
              <div>
                <p className="text-sm font-medium text-gray-500">Approved At</p>
                <p className="text-base">{formatDate(application.approved_at)}</p>
              </div>
            )}
            {application.updated_at && (
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-base">{formatDate(application.updated_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                ? 'Approve Application'
                : 'Reject Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.action} this application
              for <strong>{application.full_name}</strong>? This action
              {confirmDialog.action === 'approve'
                ? ' will create a user account and send credentials via email.'
                : ' cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmDialog.action === 'approve' ? handleApprove : handleReject
              }
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
