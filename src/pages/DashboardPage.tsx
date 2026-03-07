import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplications } from '@/hooks/useApplications';
import { usePaymentsSummary } from '@/hooks/usePaymentsSummary';
import { useMembers } from '@/hooks/useMembers';
import { formatCurrency } from '@/lib/format';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Users, UserPlus } from 'lucide-react';

export function DashboardPage() {
  const { applications, loading, pagination } = useApplications();
  const { totalApprovedAmount, loading: incomeLoading } = usePaymentsSummary();
  const { members: executiveMembers, loading: executiveLoading } = useMembers({
    executiveOnly: true,
    perPage: 50,
  });

  const pendingCount = applications.filter((app) => app.status === 'PENDING').length;
  const approvedCount = applications.filter((app) => app.status === 'APPROVED').length;
  const rejectedCount = applications.filter((app) => app.status === 'REJECTED').length;

  const stats = [
    {
      title: 'Total Applications',
      value: pagination?.total || applications.length,
      description: 'All membership applications',
    },
    {
      title: 'Pending',
      value: pendingCount,
      description: 'Awaiting review',
    },
    {
      title: 'Approved',
      value: approvedCount,
      description: 'Successfully approved',
    },
    {
      title: 'Rejected',
      value: rejectedCount,
      description: 'Rejected applications',
    },
    {
      title: 'Collection',
      value: totalApprovedAmount != null ? formatCurrency(Number(totalApprovedAmount)) : '—',
      description: 'Total approved payments',
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1">Welcome to the Alumni Admin Dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stat.title === 'Income' && incomeLoading) || (stat.title !== 'Income' && loading)
                  ? '...'
                  : stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Executive Members
          </CardTitle>
          <CardDescription>
            Members with an executive role appear on the public Executive Members page. Add or edit from Members → open member → Executive role (Secondary Member Type).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {executiveLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : executiveMembers.length === 0 ? (
            <p className="text-sm text-gray-500">No executive members yet. Open a member from Members and set their Executive role.</p>
          ) : (
            <ul className="space-y-2">
              {executiveMembers.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link to={`/members/${m.id}`} className="font-medium text-primary hover:underline">
                    {m.name}
                  </Link>
                  <span className="text-gray-500">{m.secondary_member_type?.name ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" className="mt-4">
            <Link to="/members">View All Members</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add a new member manually (one by one) or review applications.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/members/new" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add member
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/applications" className="gap-2">
                  <FileText className="w-4 h-4" />
                  View All Applications
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
