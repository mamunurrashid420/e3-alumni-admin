import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const STATUS_OPTIONS: EventStatus[] = ['draft', 'open'];

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CreateEventPage() {
  const navigate = useNavigate();
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const defaultEnd = new Date(defaultStart.getTime() + 3 * 60 * 60 * 1000);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState(toLocalDatetime(defaultStart.toISOString()));
  const [endAt, setEndAt] = useState(toLocalDatetime(defaultEnd.toISOString()));
  const [status, setStatus] = useState<EventStatus>('draft');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const start = new Date(startAt).toISOString();
      const end = new Date(endAt).toISOString();
      await apiClient.createEvent({
        title,
        description: description || null,
        location: location || null,
        start_at: start,
        end_at: end,
        status,
        cover_photo: coverPhoto,
      });
      toast.success('Event created');
      navigate('/events');
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold">New Event</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
          <CardDescription>Create a new event (draft or open for registration)</CardDescription>
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
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
