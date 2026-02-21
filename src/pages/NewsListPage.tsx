import { useState } from 'react';
import { useNews } from '@/hooks/useNews';
import { apiClient } from '@/api/client';
import type { NewsItem } from '@/types/api';
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
  slug: '',
  title: '',
  description: '',
  author: '',
  published_at: '',
  is_published: false,
  sort_order: 0,
};
type FormState = typeof emptyForm;

export function NewsListPage() {
  const { items, loading, error, refetch } = useNews();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
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

  const openEdit = (row: NewsItem) => {
    setEditing(row);
    setForm({
      slug: row.slug ?? '',
      title: row.title,
      description: row.description ?? '',
      author: row.author ?? '',
      published_at: row.published_at
        ? row.published_at.slice(0, 16)
        : '',
      is_published: row.is_published ?? false,
      sort_order: row.sort_order ?? 0,
    });
    setFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        slug: form.slug.trim() || undefined,
        title: form.title,
        description: form.description || null,
        author: form.author || null,
        published_at: form.published_at || null,
        is_published: form.is_published,
        sort_order: form.sort_order,
        image: file ?? undefined,
      };
      if (editing) {
        await apiClient.updateNews(editing.id, payload);
        toast.success('News updated');
      } else {
        await apiClient.createNews(payload);
        toast.success('News added');
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
      await apiClient.deleteNews(deleteId);
      toast.success('News removed');
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
          <h1 className="text-2xl xl:text-3xl font-bold">News</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Manage homepage news & events
          </p>
        </div>
        <Button onClick={openAdd}>Add News</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>News</CardTitle>
          <CardDescription>{items.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No news yet</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S/I</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.sort_order ?? index + 1}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {row.title}
                      </TableCell>
                      <TableCell>{row.author ?? '—'}</TableCell>
                      <TableCell>
                        {row.published_at
                          ? new Date(row.published_at).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {row.is_published ? (
                          <span className="text-green-600">Published</span>
                        ) : (
                          <span className="text-gray-500">Draft</span>
                        )}
                      </TableCell>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit News' : 'Add News'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="slug">
                Slug (optional — leave empty to auto-generate from title)
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="e.g. my-news-title"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      slug: f.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, ''),
                    }))
                  }
                >
                  From title
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="published_at">Published at</Label>
              <Input
                id="published_at"
                type="datetime-local"
                value={form.published_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, published_at: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_published"
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_published: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_published">Published (show on homepage)</Label>
            </div>
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
            <div>
              <Label htmlFor="image">
                Image {editing ? '(leave empty to keep current)' : ''}
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
            <AlertDialogTitle>Delete news</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this news item? This cannot be
              undone.
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
