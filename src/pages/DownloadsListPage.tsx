import { useState } from 'react';
import { useDownloads } from '@/hooks/useDownloads';
import { apiClient } from '@/api/client';
import type { Download } from '@/types/api';
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
import { ExternalLink } from 'lucide-react';

const emptyForm = {
  title: '',
  description: '',
  sort_order: 0,
};
type FormState = typeof emptyForm;

export function DownloadsListPage() {
  const { items, loading, error, refetch } = useDownloads();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Download | null>(null);
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

  const openEdit = (row: Download) => {
    setEditing(row);
    setForm({
      title: row.title,
      description: row.description ?? '',
      sort_order: row.sort_order,
    });
    setFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await apiClient.updateDownload(editing.id, {
          title: form.title,
          description: form.description || null,
          sort_order: form.sort_order,
          file: file ?? undefined,
        });
        toast.success('Download updated');
      } else {
        if (!file) {
          toast.error('Please select a file');
          setSubmitting(false);
          return;
        }
        await apiClient.createDownload({
          title: form.title,
          description: form.description || null,
          sort_order: form.sort_order,
          file,
        });
        toast.success('Download added');
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
      await apiClient.deleteDownload(deleteId);
      toast.success('Download removed');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Downloads</h1>
          <p className="text-gray-600 mt-1">Manage downloadable files for the frontend</p>
        </div>
        <Button onClick={openAdd}>Add Download</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Downloads</CardTitle>
          <CardDescription>{items.length} file(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No downloads yet</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S/I</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.sort_order ?? index + 1}</TableCell>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.description ?? '—'}
                      </TableCell>
                      <TableCell>
                        {row.file_url ? (
                          <a
                            href={row.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Download' : 'Add Download'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
              <Label htmlFor="file">File {editing ? '(leave empty to keep current)' : '*'}</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete download</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this download? This cannot be undone.
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
