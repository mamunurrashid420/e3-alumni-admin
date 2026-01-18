import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembers } from '@/hooks/useMembers';
import type { MembershipType } from '@/types/api';
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
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MEMBERSHIP_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { Search, X } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-gray-600 mt-1">
            View and manage all member users
          </p>
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
                    <TableHead>Primary Type</TableHead>
                    <TableHead>Secondary Type</TableHead>
                    <TableHead>Email Verified</TableHead>
                    <TableHead>Created</TableHead>
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
                        {member.primary_member_type ? (
                          <Badge variant="secondary">
                            {MEMBERSHIP_TYPE_LABELS[member.primary_member_type]}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
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
                <Button
                  variant="outline"
                  disabled={pagination.current_page === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.last_page, prev + 1)
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
