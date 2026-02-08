import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import { Calendar, MapPin, Pencil, ArrowLeft } from 'lucide-react';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id ? parseInt(id, 10) : null;
  const { event, registrations, loading, error, refetchEvent } = useEvent(eventId);

  if (eventId == null || Number.isNaN(eventId)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-600">Invalid event ID.</p>
          <Button variant="link" onClick={() => navigate('/events')}>
            Back to events
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetchEvent()}>Retry</Button>
          <Button variant="outline" className="ml-2" onClick={() => navigate('/events')}>
            Back to events
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-600">Event not found.</p>
          <Button variant="link" onClick={() => navigate('/events')}>
            Back to events
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl xl:text-3xl font-bold">{event.title}</h1>
        </div>
        <Button onClick={() => navigate(`/events/${event.id}/edit`)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Event information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.cover_photo && (
            <img
              src={event.cover_photo}
              alt={event.title}
              className="w-full max-w-md h-48 object-cover rounded-lg"
            />
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDateTime(event.event_at)} · Reg: {formatDateTime(event.registration_opens_at)} – {formatDateTime(event.registration_closes_at)}
            </span>
            {event.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Status: <span className="font-medium text-gray-700">{event.status}</span>
            {event.registration_count != null && (
              <> · {event.registration_count} registered</>
            )}
          </p>
          {event.description && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{event.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {event.photos && event.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
            <CardDescription>Event photos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt=""
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>{registrations.length} registered</CardDescription>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-gray-500 text-sm">No registrations yet.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>SSC / JSC</TableHead>
                    <TableHead className="text-right">Guests</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Registered at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>{reg.name ?? reg.user?.name ?? '—'}</TableCell>
                      <TableCell>{reg.user?.member_id ?? '—'}</TableCell>
                      <TableCell>{reg.user?.email ?? '—'}</TableCell>
                      <TableCell>{reg.phone ?? reg.user?.phone ?? '—'}</TableCell>
                      <TableCell className="max-w-[180px] truncate" title={reg.address ?? undefined}>
                        {reg.address ?? '—'}
                      </TableCell>
                      <TableCell>{reg.ssc_jsc ?? '—'}</TableCell>
                      <TableCell className="text-right">{reg.guest_count ?? 0}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={reg.notes ?? undefined}>
                        {reg.notes ?? '—'}
                      </TableCell>
                      <TableCell>{formatDateTime(reg.registered_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
