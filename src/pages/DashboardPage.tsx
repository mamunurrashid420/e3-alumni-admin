import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplications } from '@/hooks/useApplications';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export function DashboardPage() {
  const { applications, loading, pagination } = useApplications();

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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the Alumni Admin Dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Navigate to <strong>Membership Applications</strong> to review and manage applications.
            </p>
            <Button asChild>
              <Link to="/applications">
                <FileText className="w-4 h-4 mr-2" />
                View All Applications
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
