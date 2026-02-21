import { useState, useEffect, useRef } from 'react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ArrowLeft, Trash2 } from 'lucide-react';
import { PhotoViewer } from '@/components/PhotoViewer';

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
  const [shortDescription, setShortDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventAt, setEventAt] = useState('');
  const [registrationOpensAt, setRegistrationOpensAt] = useState('');
  const [registrationClosesAt, setRegistrationClosesAt] = useState('');
  const [status, setStatus] = useState<EventStatus>('draft');
  const [fee, setFee] = useState<string>('');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closePhotos, setClosePhotos] = useState<File[]>([]);
  const [closeSubmitting, setCloseSubmitting] = useState(false);
  const [galleryNewPhotos, setGalleryNewPhotos] = useState<File[]>([]);
  const [gallerySubmitting, setGallerySubmitting] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoViewerSrc, setPhotoViewerSrc] = useState<string | null>(null);
  const [photoViewerAlt, setPhotoViewerAlt] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      setShortDescription(event.short_description ?? '');
      setLocation(event.location ?? '');
      setEventAt(toLocalDatetime(event.event_at));
      setRegistrationOpensAt(toLocalDatetime(event.registration_opens_at));
      setRegistrationClosesAt(toLocalDatetime(event.registration_closes_at));
      setStatus(event.status);
      setFee(event.fee != null ? String(event.fee) : '');
    }
  }, [event]);

  // Handle cover photo preview
  useEffect(() => {
    if (coverPhoto) {
      const url = URL.createObjectURL(coverPhoto);
      setCoverPhotoPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setCoverPhotoPreview(null);
    }
  }, [coverPhoto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventId == null) return;
    setSubmitting(true);
    try {
      await apiClient.updateEvent(eventId, {
        title,
        description: description || null,
        short_description: shortDescription || null,
        location: location || null,
        event_at: new Date(eventAt).toISOString(),
        registration_opens_at: new Date(registrationOpensAt).toISOString(),
        registration_closes_at: new Date(registrationClosesAt).toISOString(),
        status,
        cover_photo: coverPhoto ?? undefined,
        fee: fee === '' ? null : Number(fee),
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

  const handleDeletePhoto = async (photoId: number) => {
    if (eventId == null) return;
    setDeletingPhotoId(photoId);
    try {
      await apiClient.deleteEventPhoto(eventId, photoId);
      toast.success('Photo removed');
      refetchEvent();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleAddGalleryPhotos = async () => {
    if (eventId == null || galleryNewPhotos.length === 0) return;
    setGallerySubmitting(true);
    try {
      await apiClient.updateEvent(eventId, { photos: galleryNewPhotos });
      toast.success('Photos added');
      setGalleryNewPhotos([]);
      galleryFileInputRef.current && (galleryFileInputRef.current.value = '');
      refetchEvent();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setGallerySubmitting(false);
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
          <h1 className="text-2xl xl:text-3xl font-bold">Edit Event</h1>
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
              <Label htmlFor="short_description">Short description</Label>
              <Input
                id="short_description"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary for homepage banner (max 500 chars)"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Shown in the homepage Get Together banner
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Full event description"
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event_at">Event date & time *</Label>
                <Input
                  id="event_at"
                  type="datetime-local"
                  value={eventAt}
                  onChange={(e) => setEventAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_opens_at">Registration opens *</Label>
                <Input
                  id="registration_opens_at"
                  type="datetime-local"
                  value={registrationOpensAt}
                  onChange={(e) => setRegistrationOpensAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_closes_at">Registration deadline *</Label>
                <Input
                  id="registration_closes_at"
                  type="datetime-local"
                  value={registrationClosesAt}
                  onChange={(e) => setRegistrationClosesAt(e.target.value)}
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
              <Label htmlFor="fee">Event fee (per person)</Label>
              <Input
                id="fee"
                type="number"
                min={0}
                step={0.01}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="Optional — same for participant and each guest"
              />
              <p className="text-xs text-muted-foreground">
                Fee per participant and per guest. Total fees = fee × (1 + number of guests).
              </p>
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
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Current cover photo:</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoViewerSrc(event.cover_photo ?? null);
                      setPhotoViewerAlt(event.title);
                      setPhotoViewerOpen(true);
                    }}
                    className="block w-full max-w-md rounded-lg overflow-hidden text-left border"
                  >
                    <img
                      src={event.cover_photo}
                      alt={event.title}
                      className="w-full max-w-md h-48 object-cover rounded-lg cursor-pointer hover:opacity-95"
                    />
                  </button>
                </div>
              )}
              {coverPhotoPreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">New cover photo preview:</p>
                  <img
                    src={coverPhotoPreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
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

      {event.status === 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle>Event gallery</CardTitle>
            <CardDescription>
              Add or remove photos from the event gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.photos && event.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {event.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden border"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoViewerSrc(photo.url);
                        setPhotoViewerAlt('');
                        setPhotoViewerOpen(true);
                      }}
                      className="block w-full text-left"
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-40 object-cover cursor-pointer hover:opacity-95"
                      />
                    </button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                      title="Remove photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                ref={galleryFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={(e) =>
                  setGalleryNewPhotos(Array.from(e.target.files ?? []))
                }
              />
              <Button
                onClick={handleAddGalleryPhotos}
                disabled={galleryNewPhotos.length === 0 || gallerySubmitting}
              >
                {gallerySubmitting ? 'Adding...' : 'Add photos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PhotoViewer
        open={photoViewerOpen}
        onOpenChange={setPhotoViewerOpen}
        src={photoViewerSrc}
        alt={photoViewerAlt}
      />

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
