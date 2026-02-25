import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';
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
import { Pagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/format';
import { Calendar, MapPin, Pencil, ArrowLeft, Download } from 'lucide-react';
import { PhotoViewer } from '@/components/PhotoViewer';
import type { EventRegistration } from '@/types/api';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id ? parseInt(id, 10) : null;
  const [registrationsPage, setRegistrationsPage] = useState(1);
  const { event, loading, error, refetchEvent } = useEvent(eventId);
  const {
    registrations,
    loading: registrationsLoading,
    pagination,
    exportAll,
  } = useEventRegistrations(eventId, registrationsPage);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoViewerSrc, setPhotoViewerSrc] = useState<string | null>(null);
  const [photoViewerAlt, setPhotoViewerAlt] = useState('');
  const [selectedRegistration, setSelectedRegistration] =
    useState<EventRegistration | null>(null);

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
            <button
              type="button"
              onClick={() => {
                setPhotoViewerSrc(event.cover_photo ?? null);
                setPhotoViewerAlt(event.title);
                setPhotoViewerOpen(true);
              }}
              className="block w-full max-w-md rounded-lg overflow-hidden text-left"
            >
              <img
                src={event.cover_photo}
                alt={event.title}
                className="w-full max-w-md h-48 object-cover rounded-lg cursor-pointer hover:opacity-95"
              />
            </button>
          )}
          <PhotoViewer
            open={photoViewerOpen}
            onOpenChange={setPhotoViewerOpen}
            src={photoViewerSrc}
            alt={photoViewerAlt}
          />
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
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    setPhotoViewerSrc(photo.url);
                    setPhotoViewerAlt('');
                    setPhotoViewerOpen(true);
                  }}
                  className="w-full rounded-lg overflow-hidden text-left"
                >
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-95"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Registrations</CardTitle>
              <CardDescription>
                {pagination
                  ? `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} registered`
                  : event.registration_count != null
                    ? `${event.registration_count} registered`
                    : 'Event registrations'}
              </CardDescription>
            </div>
            {event.registration_count != null && event.registration_count > 0 && (
              <div className="flex justify-end shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportAll(event.title)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {registrationsLoading && registrations.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading registrations...</p>
          ) : registrations.length === 0 ? (
            <p className="text-gray-500 text-sm">No registrations yet.</p>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto max-w-full">
                <Table className="table-fixed min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[9%] min-w-0">Name</TableHead>
                      <TableHead className="w-[7%] min-w-0">Member ID</TableHead>
                      <TableHead className="w-[11%] min-w-0">Email</TableHead>
                      <TableHead className="w-[8%] min-w-0">Phone</TableHead>
                      <TableHead className="w-[11%] min-w-0">Address</TableHead>
                      <TableHead className="w-[6%] min-w-0">SSC Batch</TableHead>
                      <TableHead className="w-[5%] min-w-0 text-right">Guests</TableHead>
                      <TableHead className="w-[9%] min-w-0">Guest details</TableHead>
                      <TableHead className="w-[5%] min-w-0 text-right">Fee</TableHead>
                      <TableHead className="w-[5%] min-w-0 text-right">Total fees</TableHead>
                      <TableHead className="w-[5%] min-w-0">Payment</TableHead>
                      <TableHead className="w-[9%] min-w-0">Notes</TableHead>
                      <TableHead className="w-[9%] min-w-0">Registered at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => {
                      const name = reg.name ?? reg.user?.name ?? '—';
                      const email = reg.user?.email ?? '—';
                      const phone = reg.phone ?? reg.user?.phone ?? '—';
                      const address = reg.address ?? '—';
                      const guestDetails = reg.guest_details ?? '—';
                      const notes = reg.notes ?? '—';
                      return (
                        <TableRow
                          key={reg.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <TableCell className="min-w-0 truncate" title={name}>
                            {name}
                          </TableCell>
                          <TableCell className="min-w-0 truncate" title={reg.user?.member_id ?? undefined}>
                            {reg.user?.member_id ?? '—'}
                          </TableCell>
                          <TableCell className="min-w-0 truncate" title={email}>
                            {email}
                          </TableCell>
                          <TableCell className="min-w-0 truncate" title={phone}>
                            {phone}
                          </TableCell>
                          <TableCell className="min-w-0 truncate" title={address || undefined}>
                            {address || '—'}
                          </TableCell>
                          <TableCell className="min-w-0 truncate" title={reg.ssc_jsc ?? undefined}>
                            {reg.ssc_jsc ?? '—'}
                          </TableCell>
                          <TableCell className="min-w-0 text-right">{reg.guest_count ?? 0}</TableCell>
                          <TableCell className="min-w-0 truncate" title={guestDetails || undefined}>
                            {guestDetails || '—'}
                          </TableCell>
                          <TableCell className="min-w-0 text-right">
                            {reg.participant_fee != null ? reg.participant_fee : '—'}
                          </TableCell>
                          <TableCell className="min-w-0 text-right">
                            {reg.total_fees != null ? reg.total_fees : '—'}
                          </TableCell>
                          <TableCell
                            className="min-w-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {reg.payment_document_url ? (
                              <a
                                href={reg.payment_document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate inline-block max-w-full"
                                title="Open payment document"
                              >
                                View
                              </a>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell className="min-w-0 truncate" title={notes || undefined}>
                            {notes || '—'}
                          </TableCell>
                          <TableCell className="min-w-0 whitespace-nowrap" title={formatDateTime(reg.registered_at)}>
                            {formatDateTime(reg.registered_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {pagination && pagination.last_page > 1 && (
                <Pagination
                  pagination={pagination}
                  onPageChange={setRegistrationsPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedRegistration != null}
        onOpenChange={(open) => !open && setSelectedRegistration(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <RegistrationDetailContent reg={selectedRegistration} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegistrationDetailContent({ reg }: { reg: EventRegistration }) {
  const name = reg.name ?? reg.user?.name ?? '—';
  const email = reg.user?.email ?? '—';
  const phone = reg.phone ?? reg.user?.phone ?? '—';
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-[auto_1fr]">
      <DetailRow label="Name" value={name} />
      <DetailRow label="Member ID" value={reg.user?.member_id ?? '—'} />
      <DetailRow label="Email" value={email} />
      <DetailRow label="Phone" value={phone} />
      <DetailRow label="Address" value={reg.address ?? '—'} />
      <DetailRow label="SSC Batch" value={reg.ssc_jsc ?? '—'} />
      <DetailRow label="Guests" value={String(reg.guest_count ?? 0)} />
      <DetailRow label="Guest details" value={reg.guest_details ?? '—'} />
      <DetailRow
        label="Participant fee"
        value={reg.participant_fee != null ? String(reg.participant_fee) : '—'}
      />
      <DetailRow
        label="Total fees"
        value={reg.total_fees != null ? String(reg.total_fees) : '—'}
      />
      <DetailRow
        label="Payment"
        value={
          reg.payment_document_url ? (
            <a
              href={reg.payment_document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View document
            </a>
          ) : (
            '—'
          )
        }
      />
      <DetailRow label="Notes" value={reg.notes ?? '—'} />
      <DetailRow label="Registered at" value={formatDateTime(reg.registered_at)} />
    </dl>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words">{value}</dd>
    </>
  );
}
