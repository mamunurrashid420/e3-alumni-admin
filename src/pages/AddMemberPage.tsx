import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { MembershipType } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MEMBERSHIP_TYPE_LABELS } from '@/lib/constants';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft } from 'lucide-react';

const MEMBERSHIP_TYPES: MembershipType[] = ['GENERAL', 'LIFETIME', 'ASSOCIATE'];

export function AddMemberPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    primary_member_type: 'GENERAL' as MembershipType,
    ssc_year: '',
    jsc_year: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = form.phone.replace(/\D/g, '');
    const ssc = form.ssc_year.trim() ? parseInt(form.ssc_year, 10) : null;
    const jsc = form.jsc_year.trim() ? parseInt(form.jsc_year, 10) : null;
    if (!ssc && !jsc) {
      toast.error('Either SSC year or JSC year is required to generate Member ID.');
      return;
    }
    if (phone.length !== 11) {
      toast.error('Phone must be 11 digits (e.g. 01XXXXXXXXX).');
      return;
    }
    try {
      setSaving(true);
      const member = await apiClient.createMember({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone,
        primary_member_type: form.primary_member_type,
        ssc_year: ssc,
        jsc_year: jsc,
      });
      toast.success(`Member added. Member ID: ${member.member_id}. Login credentials sent via SMS.`);
      navigate(`/members/${member.id}`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/members">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold">Add Member</h1>
          <p className="text-gray-600 mt-1">
            Add a new member manually. Member ID will be generated; login password is sent via SMS.
          </p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New member details
          </CardTitle>
          <CardDescription>
            Fill in the required fields. At least one of SSC year or JSC year is needed for Member ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (11 digits) *</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="01XXXXXXXXX"
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Login credentials will be sent to this number via SMS.</p>
            </div>
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="primary_member_type">Membership type *</Label>
              <Select
                value={form.primary_member_type}
                onValueChange={(v) => setForm((f) => ({ ...f, primary_member_type: v as MembershipType }))}
              >
                <SelectTrigger id="primary_member_type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERSHIP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {MEMBERSHIP_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ssc_year">SSC year (optional)</Label>
                <Input
                  id="ssc_year"
                  type="number"
                  min={1950}
                  max={2100}
                  value={form.ssc_year}
                  onChange={(e) => setForm((f) => ({ ...f, ssc_year: e.target.value }))}
                  placeholder="e.g. 2000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="jsc_year">JSC year (optional)</Label>
                <Input
                  id="jsc_year"
                  type="number"
                  min={1950}
                  max={2100}
                  value={form.jsc_year}
                  onChange={(e) => setForm((f) => ({ ...f, jsc_year: e.target.value }))}
                  placeholder="e.g. 1998"
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-xs text-amber-600">
              * At least one of SSC year or JSC year is required to generate the Member ID.
            </p>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Adding…' : 'Add member'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/members">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
