import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMembers } from '@/hooks/useMembers';
import { apiClient } from '@/api/client';
import type { MembershipType, Member } from '@/types/api';
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
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { MEMBERSHIP_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { Search, X, Download, Pencil, UserMinus, UserCheck, UserPlus } from 'lucide-react';

const EXPORT_PER_PAGE = 10000;
const MEMBER_CSV_COLUMNS = [
  { key: 'id' as const, header: 'ID' },
  { key: 'name' as const, header: 'Name' },
  { key: 'email' as const, header: 'Email' },
  { key: 'phone' as const, header: 'Phone' },
  { key: 'member_id' as const, header: 'Member ID' },
  { key: 'primary_member_type' as const, header: 'Primary Type' },
  { key: 'membership_expires_at' as const, header: 'Expires' },
  {
    key: (row: Member) => row.secondary_member_type?.name ?? '',
    header: 'Secondary Type',
  },
  { key: 'email_verified_at' as const, header: 'Email Verified' },
  { key: 'created_at' as const, header: 'Created' },
  // Profile fields
  { key: (row: Member) => row.profile?.name_bangla ?? '', header: 'Name (Bangla)' },
  { key: (row: Member) => row.profile?.father_name ?? '', header: 'Father Name' },
  { key: (row: Member) => row.profile?.mother_name ?? '', header: 'Mother Name' },
  { key: (row: Member) => row.profile?.gender ?? '', header: 'Gender' },
  { key: (row: Member) => row.profile?.jsc_year ?? '', header: 'JSC Year' },
  { key: (row: Member) => row.profile?.ssc_year ?? '', header: 'SSC Year' },
  {
    key: (row: Member) => row.profile?.highest_educational_degree ?? '',
    header: 'Highest Degree',
  },
  {
    key: (row: Member) => row.profile?.present_address ?? '',
    header: 'Present Address',
  },
  {
    key: (row: Member) => row.profile?.permanent_address ?? '',
    header: 'Permanent Address',
  },
  { key: (row: Member) => row.profile?.profession ?? '', header: 'Profession' },
  { key: (row: Member) => row.profile?.designation ?? '', header: 'Designation' },
  {
    key: (row: Member) => row.profile?.institute_name ?? '',
    header: 'Institute Name',
  },
  { key: (row: Member) => row.profile?.t_shirt_size ?? '', header: 'T-Shirt Size' },
  { key: (row: Member) => row.profile?.blood_group ?? '', header: 'Blood Group' },
];

export function MembersListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryMemberType, setPrimaryMemberType] = useState<
    MembershipType | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const { members, loading, error, pagination, refetch } = useMembers({
    search: debouncedSearch || undefined,
    primaryMemberType,
    page: currentPage,
  });

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setPrimaryMemberType(undefined);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setPrimaryMemberType(value === 'all' ? undefined : (value as MembershipType));
    setCurrentPage(1);
  }, []);

  const [exportLoading, setExportLoading] = useState(false);
  const [togglingDisabledId, setTogglingDisabledId] = useState<number | null>(null);

  const handleToggleDisabled = useCallback(
    async (e: React.MouseEvent, member: Member) => {
      e.stopPropagation();
      const isDisabling = !member.disabled_at;
      if (isDisabling && !confirm(`Disable ${member.name}? They will no longer be able to log in.`)) {
        return;
      }
      setTogglingDisabledId(member.id);
      try {
        if (isDisabling) {
          await apiClient.disableMember(member.id);
          toast.success(`${member.name} disabled`);
        } else {
          await apiClient.enableMember(member.id);
          toast.success(`${member.name} re-enabled`);
        }
        refetch();
      } catch (err) {
        toast.error(handleApiError(err));
      } finally {
        setTogglingDisabledId(null);
      }
    },
    [refetch]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      navigate(`/members/${id}`);
    },
    [navigate]
  );

  const handleExportCsv = useCallback(async () => {
    setExportLoading(true);
    try {
      const res = await apiClient.getMembers(
        debouncedSearch || undefined,
        primaryMemberType,
        1,
        EXPORT_PER_PAGE
      );
      exportToCsv<Member>(res.data, 'members.csv', MEMBER_CSV_COLUMNS);
      toast.success(`Exported ${res.data.length} members`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setExportLoading(false);
    }
  }, [debouncedSearch, primaryMemberType]);

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading members...</div>
        </div>
      </div>
    );
  }

  if (error && members.length === 0) {
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
          <h1 className="text-2xl xl:text-3xl font-bold">Members</h1>
          <p className="text-gray-600 mt-1">
            View and manage all member users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/members/new" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add member
            </Link>
          </Button>
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or member ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-48">
                <Select
                  value={primaryMemberType || 'all'}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="LIFETIME">Lifetime</SelectItem>
                    <SelectItem value="ASSOCIATE">Associate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(searchQuery || primaryMemberType) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearch}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
            {pagination && (
              <CardDescription>
                Showing {pagination.from} to {pagination.to} of{' '}
                {pagination.total} members
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Primary Type</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Secondary Type</TableHead>
                    <TableHead>Email Verified</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <TableCell className="font-medium">{member.id}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {member.member_id ? (
                          <Badge variant="outline">{member.member_id}</Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.disabled_at ? (
                          <Badge variant="destructive">Disabled</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.primary_member_type ? (
                          <Badge variant="secondary">
                            {MEMBERSHIP_TYPE_LABELS[member.primary_member_type]}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.membership_expires_at ? (
                          formatDate(member.membership_expires_at)
                        ) : (
                          <span className="text-gray-400">
                            {member.primary_member_type === 'LIFETIME'
                              ? 'Never'
                              : 'N/A'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.secondary_member_type ? (
                          <span>{member.secondary_member_type.name}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.email_verified_at ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(member.created_at)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => handleEdit(e, member.id)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            disabled={togglingDisabledId === member.id}
                            onClick={(e) => handleToggleDisabled(e, member)}
                          >
                            {togglingDisabledId === member.id ? (
                              <span className="animate-pulse">...</span>
                            ) : member.disabled_at ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Enable
                              </>
                            ) : (
                              <>
                                <UserMinus className="w-3.5 h-3.5" />
                                Disable
                              </>
                            )}
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
    </div>
  );
}
