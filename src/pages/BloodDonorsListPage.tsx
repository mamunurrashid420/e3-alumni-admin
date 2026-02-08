import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBloodDonors } from '@/hooks/useBloodDonors';
import type { Member } from '@/types/api';
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
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BLOOD_GROUPS } from '@/lib/constants';
import { handleApiError } from '@/lib/errorHandler';
import { Search, X, Droplets } from 'lucide-react';

export function BloodDonorsListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchQuery]);

  const { members, loading, error, pagination, refetch } = useBloodDonors({
    search: debouncedSearch || undefined,
    bloodGroup,
    page: currentPage,
  });

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setBloodGroup(undefined);
    setCurrentPage(1);
  }, []);

  const handleFilterByBloodGroup = useCallback((value: string) => {
    setBloodGroup(value === 'all' ? undefined : value);
    setCurrentPage(1);
  }, []);

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading blood donors...</div>
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
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold flex items-center gap-2">
          <Droplets className="w-8 h-8 text-red-500" />
          Blood Donors
        </h1>
        <p className="text-gray-600 mt-1">
          Members who have shared their blood group (from member profiles)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or member ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-40">
                <Select
                  value={bloodGroup || 'all'}
                  onValueChange={handleFilterByBloodGroup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All groups</SelectItem>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(searchQuery || bloodGroup) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
            {pagination && (
              <CardDescription>
                Showing {pagination.from} to {pagination.to} of {pagination.total} blood donors
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No blood donors found. Members must have a blood group set in their profile to appear here.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Blood group</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Member ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member: Member) => (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">
                          {member.profile?.blood_group ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell>{member.phone ?? '—'}</TableCell>
                      <TableCell>{member.email ?? '—'}</TableCell>
                      <TableCell>{member.member_id ?? '—'}</TableCell>
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
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
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
