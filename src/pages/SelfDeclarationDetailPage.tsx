import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { SelfDeclaration } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthenticatedImage } from '@/components/AuthenticatedImage';
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
import { SELF_DECLARATION_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function SelfDeclarationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selfDeclaration, setSelfDeclaration] = useState<SelfDeclaration | null>(null);
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
    loadSelfDeclaration();
  }, [id]);

  const loadSelfDeclaration = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getSelfDeclaration(Number(id));
      setSelfDeclaration(response.data);
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
      await apiClient.approveSelfDeclaration(Number(id));
      toast.success(
        'Self-declaration approved successfully. Secondary member type assigned.'
      );
      loadSelfDeclaration();
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
      await apiClient.rejectSelfDeclaration(Number(id));
      toast.success('Self-declaration rejected successfully');
      loadSelfDeclaration();
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
          <div className="text-lg">Loading self-declaration details...</div>
        </div>
      </div>
    );
  }

  if (error || !selfDeclaration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error || 'Self-declaration not found'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/self-declarations')}>
              Back to List
            </Button>
            <Button variant="outline" onClick={loadSelfDeclaration}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract values for template display
  const templateName = selfDeclaration.name || '';
  const templateDesignation = selfDeclaration.secondary_member_type?.name || '';
  const templateMemberNumber = selfDeclaration.user?.member_id || '';

  return (
    <div className="space-y-6">
      {/* Admin Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Self-Declaration #{selfDeclaration.id}</h1>
          <p className="text-gray-600 mt-1">
            <Link
              to="/self-declarations"
              className="text-blue-600 hover:underline"
            >
              ← Back to self-declarations
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={getStatusBadgeVariant(selfDeclaration.status)}>
            {SELF_DECLARATION_STATUS_LABELS[selfDeclaration.status]}
          </Badge>
          {selfDeclaration.status === 'PENDING' && (
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

      {/* Self-Declaration Template View */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">
              স্ব-ঘোষণাপত্র (Self-Declaration Form)
            </h1>
            <p className="text-sm text-black">
              জাহাপুর মাধ্যমিক বিদ্যালয় অ্যালামনাই অ্যাসোসিয়েশন (JSSAA)
            </p>
          </div>

          {/* Declaration Text */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-4 text-sm text-black leading-relaxed">
              <p className="font-semibold mb-4 leading-relaxed flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span>আমি,</span>
                <Input
                  type="text"
                  value={templateName}
                  readOnly
                  className="inline-flex min-w-[180px] max-w-[220px] h-7 px-2 py-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-400 rounded-none focus:border-gray-600 focus-visible:ring-0 focus-visible:outline-none shadow-none cursor-default"
                />
                <span>পদবি</span>
                <Input
                  type="text"
                  value={templateDesignation}
                  readOnly
                  className="inline-flex min-w-[180px] max-w-[220px] h-7 px-2 py-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-400 rounded-none focus:border-gray-600 focus-visible:ring-0 focus-visible:outline-none shadow-none cursor-default"
                />
                <span>সদস্য নম্বর</span>
                <Input
                  type="text"
                  value={templateMemberNumber}
                  readOnly
                  className="inline-flex min-w-[120px] max-w-[160px] h-7 px-2 py-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-400 rounded-none focus:border-gray-600 focus-visible:ring-0 focus-visible:outline-none shadow-none cursor-default"
                />
                <span>জাহাপুর মাধ্যমিক বিদ্যালয় অ্যালামনাই অ্যাসোসিয়েশন (JSSAA) এর নির্বাহী কমিটির একজন সদস্য হিসেবে দায়িত্ব গ্রহণ করছি এবং সম্পূর্ণ সততার সাথে নিম্নোক্ত অঙ্গীকারসমূহ করছি:</span>
              </p>

              <div className="space-y-3 ml-4">
                <p>
                  <span className="font-semibold">ক)</span> বিদ্যালয় ও সংগঠনের স্বার্থকে সর্বোচ্চ অগ্রাধিকার দেব এবং সংগঠনের গঠনতন্ত্র, নীতিমালা ও সিদ্ধান্ত যথাযথভাবে মেনে চলবো।
                </p>
                <p>
                  <span className="font-semibold">খ)</span> দায়িত্ব পালনের ক্ষেত্রে জাত, লিঙ্গ, ধর্ম, বর্ণ, পেশা, মতাদর্শ, ভৌগোলিক বা সামাজিক পরিচয় নির্বিশেষে সকলের প্রতি সমান ও ন্যায়সঙ্গত আচরণ করবো।
                </p>
                <p>
                  <span className="font-semibold">গ)</span> ব্যক্তিগত, পারিবারিক, গোষ্ঠীগত বা রাজনৈতিক স্বার্থে সংগঠনের পদ বা প্রভাব ব্যবহার করবো না এবং স্বার্থের সংঘাত (Conflict of Interest) এড়িয়ে চলবো।
                </p>
                <p>
                  <span className="font-semibold">ঘ)</span> সকল কার্যক্রমে স্বচ্ছতা, জবাবদিহিতা ও নৈতিকতা বজায় রাখবো এবং আর্থিক অনিয়ম, দুর্নীতি, তহবিলের অপব্যবহার ও ক্ষমতার অপব্যবহারের বিরুদ্ধে অবস্থান করবো।
                </p>
                <p>
                  <span className="font-semibold">ঙ)</span> সংগঠনের সম্মান, ঐক্য ও সুনাম রক্ষায় সচেষ্ট থাকবো এবং বিভেদ, অসদাচরণ, হয়রানি, মানহানিকর বা অশালীন আচরণ, মিথ্যা তথ্য ছড়ানো (অনলাইন/অফলাইন) থেকে বিরত থাকবো।
                </p>
              </div>

              <p className="mt-4">
                উপরোক্ত ঘোষণার কোনো অংশ ভঙ্গ করলে সংগঠনের গঠনতন্ত্র অনুযায়ী শৃঙ্খলামূলক ব্যবস্থা গ্রহণ করা হতে পারে—যা আমি মেনে নিতে বাধ্য থাকবো। আমি এ ঘোষণা পূর্ণ বিবেচনা ও স্বেচ্ছায় প্রদান করলাম।
              </p>
            </div>
          </div>

          {/* Form Details */}
          <div className="space-y-6 mb-8">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                নাম <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={selfDeclaration.name}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>

            {/* Signature File Display */}
            {selfDeclaration.signature_file && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  স্বাক্ষর <span className="text-red-500">*</span>
                </label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <AuthenticatedImage
                    src={selfDeclaration.signature_file}
                    alt="Signature"
                    className="max-w-full h-auto max-h-96 mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Designation/Post Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                পদবী <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={selfDeclaration.secondary_member_type?.name || 'N/A'}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                তারিখ <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formatDate(selfDeclaration.date)}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-black text-center">
            <p>Address: Jahapur Secondary School Campus, Jahapur, Babuganj, Barishal.</p>
            <p>Contact: 01686787972, 01832133397, 01707-431497</p>
            <p>Web: www.jssalumni.org</p>
            <p>Email: jssaa2025@gmail.com</p>
          </div>
        </div>

        {/* Additional Admin Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status and Approval Info */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant={getStatusBadgeVariant(selfDeclaration.status)} className="mt-1">
                  {SELF_DECLARATION_STATUS_LABELS[selfDeclaration.status]}
                </Badge>
              </div>
              {selfDeclaration.approved_by && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved By</p>
                  <p className="text-base">{selfDeclaration.approved_by.name}</p>
                  {selfDeclaration.approved_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(selfDeclaration.approved_at)}
                    </p>
                  )}
                </div>
              )}
              {selfDeclaration.rejected_reason && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                  <p className="text-base text-red-600">
                    {selfDeclaration.rejected_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selfDeclaration.user ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">User Name</p>
                    <p className="text-base">{selfDeclaration.user.name}</p>
                  </div>
                  {selfDeclaration.user.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base">{selfDeclaration.user.email}</p>
                    </div>
                  )}
                  {selfDeclaration.user.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-base">{selfDeclaration.user.phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">User information not available</p>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-base">{formatDate(selfDeclaration.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="text-base">{formatDate(selfDeclaration.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve'
                ? 'Approve Self-Declaration'
                : 'Reject Self-Declaration'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.action} this self-declaration
              for <strong>{selfDeclaration.name}</strong>? This action
              {confirmDialog.action === 'approve'
                ? ' will assign the secondary member type to the user.'
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
