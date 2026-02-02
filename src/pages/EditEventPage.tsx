import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { apiClient } from '@/api/client';
import type { EventStatus } from '@/types/api';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const STATUS_OPTIONS: EventStatus[] = ['draft', 'open', 'closed'];

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id ? parseInt(id, 10) : null;
  const { event, loading, error, refetchEvent } = useEvent(eventId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [status, setStatus] = useState<EventStatus>('draft');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closePhotos, setClosePhotos] = useState<File[]>([]);
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      setLocation(event.location ?? '');
      setStartAt(toLocalDatetime(event.start_at));
      setEndAt(toLocalDatetime(event.end_at));
      setStatus(event.status);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventId == null) return;
    setSubmitting(true);
    try {
      const start = new Date(startAt).toISOString();
      const end = new Date(endAt).toISOString();
      await apiClient.updateEvent(eventId, {
        title,
        description: description || null,
        location: location || null,
        start_at: start,
        end_at: end,
        status,
        cover_photo: coverPhoto ?? undefined,
      });
      toast.success('Event updated');
      refetchEvent();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseEvent = async () => {
    if (eventId == null) return;
    setCloseSubmitting(true);
    try {
      await apiClient.updateEvent(eventId, {
        status: 'closed',
        photos: closePhotos.length > 0 ? closePhotos : undefined,
      });
      toast.success('Event closed');
      setCloseDialogOpen(false);
      setClosePhotos([]);
      refetchEvent();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setCloseSubmitting(false);
    }
  };

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

  const isOpen = event.status === 'open';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Event</h1>
        </div>
        {isOpen && (
          <Button variant="destructive" onClick={() => setCloseDialogOpen(true)}>
            Close event & add photos
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
          <CardDescription>Update event information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Event title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue or address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_at">Start date & time *</Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_at">End date & time *</Label>
                <Input
                  id="end_at"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover_photo">Cover photo</Label>
              <Input
                id="cover_photo"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setCoverPhoto(e.target.files?.[0] ?? null)}
              />
              {event.cover_photo && !coverPhoto && (
                <p className="text-xs text-gray-500">Current cover photo is set.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/events/${eventId}`)}
              >
                View event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close event</DialogTitle>
            <DialogDescription>
              Set this event to closed and optionally add gallery photos. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="close_photos">Event photos (optional)</Label>
            <Input
              id="close_photos"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              multiple
              onChange={(e) => setClosePhotos(Array.from(e.target.files ?? []))}
            />
            {closePhotos.length > 0 && (
              <p className="text-xs text-gray-500">{closePhotos.length} file(s) selected</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCloseEvent} disabled={closeSubmitting}>
              {closeSubmitting ? 'Closing...' : 'Close event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
