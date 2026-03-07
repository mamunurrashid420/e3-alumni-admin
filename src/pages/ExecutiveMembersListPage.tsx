import { useMembers } from '@/hooks/useMembers';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

export function ExecutiveMembersListPage() {
  const { members, loading, error } = useMembers({
    executiveOnly: true,
    perPage: 100,
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold">Executive Members</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1">
          These members appear on the public Executive Members page. To add or change someone’s role, open the member and set <strong>Executive role (Secondary Member Type)</strong> in Membership Information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            List
          </CardTitle>
          <CardDescription>
            Members with an executive role. Click a row to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-gray-500">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {!loading && !error && members.length === 0 && (
            <p className="text-sm text-gray-500">
              No executive members yet. Go to <Link to="/members" className="text-primary underline">Members</Link>, open a member, and set their Executive role in Membership Information.
            </p>
          )}
          {!loading && !error && members.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <Link
                  key={m.id}
                  to={`/members/${m.id}`}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {m.profile?.photo ? (
                      <img
                        src={m.profile.photo}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-medium">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{m.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {m.secondary_member_type?.name ?? '—'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
