import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { Member, MemberProfile } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MEMBERSHIP_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

const emptyProfileForm = {
  name_bangla: '',
  father_name: '',
  mother_name: '',
  gender: '',
  jsc_year: '',
  ssc_year: '',
  highest_educational_degree: '',
  present_address: '',
  permanent_address: '',
  profession: '',
  designation: '',
  institute_name: '',
  t_shirt_size: '',
  blood_group: '',
};

function profileToForm(p: MemberProfile | null): typeof emptyProfileForm {
  if (!p) return emptyProfileForm;
  return {
    name_bangla: p.name_bangla ?? '',
    father_name: p.father_name ?? '',
    mother_name: p.mother_name ?? '',
    gender: p.gender ?? '',
    jsc_year: p.jsc_year != null ? String(p.jsc_year) : '',
    ssc_year: p.ssc_year != null ? String(p.ssc_year) : '',
    highest_educational_degree: p.highest_educational_degree ?? '',
    present_address: p.present_address ?? '',
    permanent_address: p.permanent_address ?? '',
    profession: p.profession ?? '',
    designation: p.designation ?? '',
    institute_name: p.institute_name ?? '',
    t_shirt_size: p.t_shirt_size ?? '',
    blood_group: p.blood_group ?? '',
  };
}

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPhoneChangedPrompt, setShowPhoneChangedPrompt] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [renewYears, setRenewYears] = useState<1 | 2 | 3>(1);
  const [renewing, setRenewing] = useState(false);

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

  const handleEdit = () => {
    if (!member) return;
    setEditForm({
      name: member.name,
      email: member.email ?? '',
      phone: member.phone ?? '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveMember = async () => {
    if (!member || !member.id) return;
    const phone = editForm.phone.trim();
    if (!phone) {
      toast.error('Phone number is required');
      return;
    }
    try {
      setSaving(true);
      const response = await apiClient.updateMember(member.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim() || null,
        phone,
      });
      const { phone_changed: _pc, ...updatedMember } = response;
      setMember({ ...member, ...updatedMember });
      setIsEditing(false);
      toast.success('Member updated successfully');
      if (response.phone_changed) {
        setShowPhoneChangedPrompt(true);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleResendSms = async () => {
    if (!member || !member.id) return;

    if (!confirm(`Are you sure you want to resend credentials via SMS to ${member.name}?`)) {
      return;
    }

    try {
      setResending(true);
      const response = await apiClient.resendSms(member.id);
      toast.success(response.message);
      setShowPhoneChangedPrompt(false);
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleRenewMembership = async () => {
    if (!member?.id) return;
    try {
      setRenewing(true);
      const response = await apiClient.renewMembership(member.id, renewYears);
      setMember(response.data);
      setRenewDialogOpen(false);
      toast.success(
        `Membership renewed. New expiry: ${formatDate(response.data.membership_expires_at ?? '')}`
      );
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setRenewing(false);
    }
  };

  const handleEditProfile = () => {
    if (!member?.profile) return;
    setProfileForm(profileToForm(member.profile));
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!member?.id || !member.profile) return;
    try {
      setSavingProfile(true);
      const payload = {
        name_bangla: profileForm.name_bangla.trim() || null,
        father_name: profileForm.father_name.trim() || null,
        mother_name: profileForm.mother_name.trim() || null,
        gender: profileForm.gender.trim() || null,
        jsc_year: profileForm.jsc_year.trim() ? parseInt(profileForm.jsc_year, 10) : null,
        ssc_year: profileForm.ssc_year.trim() ? parseInt(profileForm.ssc_year, 10) : null,
        highest_educational_degree: profileForm.highest_educational_degree.trim() || null,
        present_address: profileForm.present_address.trim() || null,
        permanent_address: profileForm.permanent_address.trim() || null,
        profession: profileForm.profession.trim() || null,
        designation: profileForm.designation.trim() || null,
        institute_name: profileForm.institute_name.trim() || null,
        t_shirt_size: profileForm.t_shirt_size.trim() || null,
        blood_group: profileForm.blood_group.trim() || null,
      };
      const response = await apiClient.updateMemberProfile(member.id, payload);
      setMember(response.data);
      setIsEditingProfile(false);
      toast.success('Member profile updated successfully');
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage);
    } finally {
      setSavingProfile(false);
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
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold">{member.name}</h1>
          <p className="text-gray-600 mt-1">
            <Link to="/members" className="text-blue-600 hover:underline">
              ← Back to members
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" onClick={handleEdit}>
              Edit
            </Button>
          ) : null}
          {member.phone && !isEditing && (
            <Button
              variant="outline"
              onClick={handleResendSms}
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend SMS Credentials'}
            </Button>
          )}
          {!isEditing &&
            (member.primary_member_type === 'GENERAL' ||
              member.primary_member_type === 'ASSOCIATE') && (
              <Button
                variant="outline"
                onClick={() => setRenewDialogOpen(true)}
              >
                Renew membership
              </Button>
            )}
        </div>
      </div>

      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew membership</DialogTitle>
            <DialogDescription>
              Extend {member.name}&apos;s membership. Select how many years to add.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="renew-years">Years to add</Label>
            <Select
              value={String(renewYears)}
              onValueChange={(v) => setRenewYears(Number(v) as 1 | 2 | 3)}
            >
              <SelectTrigger id="renew-years" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 year</SelectItem>
                <SelectItem value="2">2 years</SelectItem>
                <SelectItem value="3">3 years</SelectItem>
              </SelectContent>
            </Select>
            {member.membership_expires_at && (
              <p className="text-sm text-muted-foreground mt-2">
                Current expiry: {formatDate(member.membership_expires_at)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenewDialogOpen(false)}
              disabled={renewing}
            >
              Cancel
            </Button>
            <Button onClick={handleRenewMembership} disabled={renewing}>
              {renewing ? 'Renewing...' : 'Renew'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPhoneChangedPrompt && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
              Phone number was updated. Resend SMS credentials to the new number?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendSms}
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend SMS'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone (required)</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveMember}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
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
                  <p className="text-base">{member.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base">{member.phone || 'N/A'}</p>
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
              </>
            )}
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
                Membership Expires
              </p>
              {member.membership_expires_at ? (
                <p className="text-base">{formatDate(member.membership_expires_at)}</p>
              ) : (
                <p className="text-base text-gray-400">
                  {member.primary_member_type === 'LIFETIME' ? 'Never (Lifetime)' : 'N/A'}
                </p>
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

        {/* Member Profile (from member_profiles) */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Member Profile</CardTitle>
              <CardDescription>
                Detailed profile (address, profession, education, etc.)
              </CardDescription>
            </div>
            {member.profile && !isEditingProfile && (
              <Button variant="outline" size="sm" onClick={handleEditProfile}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {member.profile ? (
              isEditingProfile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile-name_bangla">Name (Bangla)</Label>
                    <Input
                      id="profile-name_bangla"
                      value={profileForm.name_bangla}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, name_bangla: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-father_name">Father&apos;s Name</Label>
                    <Input
                      id="profile-father_name"
                      value={profileForm.father_name}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, father_name: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-mother_name">Mother&apos;s Name</Label>
                    <Input
                      id="profile-mother_name"
                      value={profileForm.mother_name}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, mother_name: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-gender">Gender</Label>
                    <Select
                      value={profileForm.gender || undefined}
                      onValueChange={(v) =>
                        setProfileForm((p) => ({ ...p, gender: v }))
                      }
                    >
                      <SelectTrigger id="profile-gender" className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="profile-jsc_year">JSC Year</Label>
                    <Input
                      id="profile-jsc_year"
                      type="number"
                      value={profileForm.jsc_year}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, jsc_year: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-ssc_year">SSC Year</Label>
                    <Input
                      id="profile-ssc_year"
                      type="number"
                      value={profileForm.ssc_year}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, ssc_year: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="profile-highest_educational_degree">Highest Degree</Label>
                    <Input
                      id="profile-highest_educational_degree"
                      value={profileForm.highest_educational_degree}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          highest_educational_degree: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="profile-present_address">Present Address</Label>
                    <Input
                      id="profile-present_address"
                      value={profileForm.present_address}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, present_address: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="profile-permanent_address">Permanent Address</Label>
                    <Input
                      id="profile-permanent_address"
                      value={profileForm.permanent_address}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, permanent_address: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-profession">Profession</Label>
                    <Input
                      id="profile-profession"
                      value={profileForm.profession}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, profession: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-designation">Designation</Label>
                    <Input
                      id="profile-designation"
                      value={profileForm.designation}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, designation: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-institute_name">Institute</Label>
                    <Input
                      id="profile-institute_name"
                      value={profileForm.institute_name}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, institute_name: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-t_shirt_size">T-shirt Size</Label>
                    <Input
                      id="profile-t_shirt_size"
                      value={profileForm.t_shirt_size}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, t_shirt_size: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-blood_group">Blood Group</Label>
                    <Input
                      id="profile-blood_group"
                      value={profileForm.blood_group}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, blood_group: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-2 pt-2">
                    <Button onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <Button variant="outline" onClick={handleCancelEditProfile}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name (Bangla)</p>
                    <p className="text-base">{member.profile.name_bangla || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Father&apos;s Name</p>
                    <p className="text-base">{member.profile.father_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mother&apos;s Name</p>
                    <p className="text-base">{member.profile.mother_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-base">{member.profile.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">SSC Year</p>
                    <p className="text-base">{member.profile.ssc_year ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Highest Degree</p>
                    <p className="text-base">{member.profile.highest_educational_degree || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Present Address</p>
                    <p className="text-base whitespace-pre-wrap">{member.profile.present_address || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Permanent Address</p>
                    <p className="text-base whitespace-pre-wrap">{member.profile.permanent_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Profession</p>
                    <p className="text-base">{member.profile.profession || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Designation</p>
                    <p className="text-base">{member.profile.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Institute</p>
                    <p className="text-base">{member.profile.institute_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">T-shirt Size</p>
                    <p className="text-base">{member.profile.t_shirt_size || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Group</p>
                    <p className="text-base">{member.profile.blood_group || 'N/A'}</p>
                  </div>
                  {(member.profile.photo || member.profile.signature) && (
                    <div className="sm:col-span-2 flex flex-wrap gap-4">
                      {member.profile.photo && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Photo</p>
                          <a
                            href={member.profile.photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View photo
                          </a>
                        </div>
                      )}
                      {member.profile.signature && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Signature</p>
                          <a
                            href={member.profile.signature}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View signature
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              <p className="text-gray-500 text-sm">No profile data (member may not have an approved profile yet).</p>
            )}
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
