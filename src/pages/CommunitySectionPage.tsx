import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
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
import { handleApiError, getValidationErrors } from '@/lib/errorHandler';
import { toast } from 'sonner';

export function CommunitySectionPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await apiClient.getCommunitySection();
      setImageUrl(res.data.image);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Select an image to update');
      return;
    }
    setSaving(true);
    try {
      await apiClient.updateCommunitySection({ image: file });
      toast.success('Community section image updated');
      setFile(null);
      load();
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      const imgErr = validationErrors.image?.[0];
      if (imgErr) toast.error(imgErr);
      else toast.error(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold">Community Section Image</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1">
          Set the image shown in the &quot;Creating A Community Of Life Long Learners&quot; section on the homepage (arched image on the left).
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Current image (shown on homepage)</CardTitle>
            <CardDescription>
              This is the image currently displayed in the Community section on the frontend.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => load(true)}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Image</Label>
            <div className="relative w-full max-w-md h-64 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Current community section"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-gray-100">
                    Failed to load
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No image set</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload new image</CardTitle>
          <CardDescription>
            Choose a file to replace. JPG/PNG, max 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Image</Label>
              {(imageUrl || file) && (
                <div className="relative w-full max-w-md h-48 rounded border bg-gray-100 overflow-hidden">
                  <img
                    src={file ? URL.createObjectURL(file) : imageUrl!}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" disabled={saving || !file}>
              {saving ? 'Saving...' : 'Save image'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
