import { useState } from 'react';
import { useHeroSlides } from '@/hooks/useHeroSlides';
import { apiClient } from '@/api/client';
import type { HeroSlide } from '@/types/api';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { handleApiError } from '@/lib/errorHandler';
import { toast } from 'sonner';

const emptyForm = {
  title: '',
  subtitle: '',
  description: '',
  primary_button_label: '',
  primary_button_url: '',
  secondary_button_label: '',
  secondary_button_url: '',
  sort_order: 0,
  is_active: true,
};
type FormState = typeof emptyForm;

export function SliderListPage() {
  const { items, loading, error, refetch } = useHeroSlides();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setDialogOpen(true);
  };

  const openEdit = (row: HeroSlide) => {
    setEditing(row);
    setForm({
      title: row.title,
      subtitle: row.subtitle ?? '',
      description: row.description ?? '',
      primary_button_label: row.primary_button_label ?? '',
      primary_button_url: row.primary_button_url ?? '',
      secondary_button_label: row.secondary_button_label ?? '',
      secondary_button_url: row.secondary_button_url ?? '',
      sort_order: row.sort_order,
      is_active: row.is_active,
    });
    setFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await apiClient.updateHeroSlide(editing.id, {
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          primary_button_label: form.primary_button_label,
          primary_button_url: form.primary_button_url,
          secondary_button_label: form.secondary_button_label,
          secondary_button_url: form.secondary_button_url,
          sort_order: form.sort_order,
          is_active: form.is_active,
          image: file ?? undefined,
        });
        toast.success('Slide updated');
      } else {
        if (!file) {
          toast.error('Please select an image');
          setSubmitting(false);
          return;
        }
        await apiClient.createHeroSlide({
          image: file,
          title: form.title,
          subtitle: form.subtitle || null,
          description: form.description || null,
          primary_button_label: form.primary_button_label || null,
          primary_button_url: form.primary_button_url || null,
          secondary_button_label: form.secondary_button_label || null,
          secondary_button_url: form.secondary_button_url || null,
          sort_order: form.sort_order,
          is_active: form.is_active,
        });
        toast.success('Slide added');
      }
      setDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteHeroSlide(deleteId);
      toast.success('Slide removed');
      setDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold">Homepage Slider</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Manage hero slider slides shown on the homepage
          </p>
        </div>
        <Button onClick={openAdd}>Add Slide</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slider Slides</CardTitle>
          <CardDescription>{items.length} slide(s). Order by sort order.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No slides yet. Add one to show on the homepage.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.sort_order ?? index + 1}</TableCell>
                      <TableCell>
                        {row.image ? (
                          <img
                            src={row.image}
                            alt={row.title}
                            className="h-12 w-20 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{row.subtitle ?? '—'}</TableCell>
                      <TableCell>{row.is_active ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(row)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(row.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Slide' : 'Add Slide'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. We Are Proud"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="e.g. Students Of TEC Barishal"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description for the slide"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_label">Primary button label</Label>
                <Input
                  id="primary_label"
                  value={form.primary_button_label}
                  onChange={(e) => setForm((f) => ({ ...f, primary_button_label: e.target.value }))}
                  placeholder="Our Mission"
                />
              </div>
              <div>
                <Label htmlFor="primary_url">Primary button URL</Label>
                <Input
                  id="primary_url"
                  value={form.primary_button_url}
                  onChange={(e) => setForm((f) => ({ ...f, primary_button_url: e.target.value }))}
                  placeholder="/about/mission-vision"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secondary_label">Secondary button label</Label>
                <Input
                  id="secondary_label"
                  value={form.secondary_button_label}
                  onChange={(e) => setForm((f) => ({ ...f, secondary_button_label: e.target.value }))}
                  placeholder="Our Story"
                />
              </div>
              <div>
                <Label htmlFor="secondary_url">Secondary button URL</Label>
                <Input
                  id="secondary_url"
                  value={form.secondary_button_url}
                  onChange={(e) => setForm((f) => ({ ...f, secondary_button_url: e.target.value }))}
                  placeholder="/about/history"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <Label htmlFor="sort_order">Sort order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active (show on homepage)</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="image">
                Image {editing ? '(leave empty to keep current)' : '*'}
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this slide? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
