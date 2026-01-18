import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { Member } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MEMBERSHIP_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMember(Number(id));
      setMember(response.data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading member details...</div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error || 'Member not found'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/members')}>Back to List</Button>
            <Button variant="outline" onClick={loadMember}>
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
          <h1 className="text-3xl font-bold">{member.name}</h1>
          <p className="text-gray-600 mt-1">
            <Link to="/members" className="text-blue-600 hover:underline">
              ← Back to members
            </Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="text-base">{member.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-base">{member.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base">{member.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-base">{member.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Member ID</p>
              {member.member_id ? (
                <Badge variant="outline" className="text-base">
                  {member.member_id}
                </Badge>
              ) : (
                <p className="text-base text-gray-400">N/A</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Membership Information */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Primary Member Type
              </p>
              {member.primary_member_type ? (
                <Badge variant="secondary" className="text-base">
                  {MEMBERSHIP_TYPE_LABELS[member.primary_member_type]}
                </Badge>
              ) : (
                <p className="text-base text-gray-400">N/A</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Secondary Member Type
              </p>
              {member.secondary_member_type ? (
                <div>
                  <p className="text-base font-medium">
                    {member.secondary_member_type.name}
                  </p>
                  {member.secondary_member_type.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {member.secondary_member_type.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-400">N/A</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Email Verified
              </p>
              {member.email_verified_at ? (
                <div>
                  <Badge variant="default" className="mb-1">
                    Yes
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Verified on {formatDate(member.email_verified_at)}
                  </p>
                </div>
              ) : (
                <Badge variant="secondary">No</Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Created</p>
              <p className="text-base">{formatDate(member.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-base">{formatDate(member.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
