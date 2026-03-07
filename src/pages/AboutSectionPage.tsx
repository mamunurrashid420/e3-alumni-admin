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

export function AboutSectionPage() {
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [overlappingImageUrl, setOverlappingImageUrl] = useState<string | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [overlapFile, setOverlapFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await apiClient.getAboutSection();
      setMainImageUrl(res.data.main_image);
      setOverlappingImageUrl(res.data.overlapping_image);
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
    if (!mainFile && !overlapFile) {
      toast.error('Select at least one image to update');
      return;
    }
    setSaving(true);
    try {
      if (mainFile) {
        await apiClient.updateAboutSection({ main_image: mainFile });
      }
      if (overlapFile) {
        await apiClient.updateAboutSection({ overlapping_image: overlapFile });
      }
      toast.success('About section images updated');
      setMainFile(null);
      setOverlapFile(null);
      load();
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      const mainErr = validationErrors.main_image?.[0];
      const overlapErr = validationErrors.overlapping_image?.[0];
      if (mainErr) toast.error(`Main image: ${mainErr}`);
      if (overlapErr) toast.error(`Overlapping image: ${overlapErr}`);
      if (!mainErr && !overlapErr) toast.error(handleApiError(err));
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
        <h1 className="text-2xl xl:text-3xl font-bold">About Us Section</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1">
          Set the two images shown in the About Us section on the homepage
        </p>
      </div>

      {/* Current images – always visible so admin can see what’s on the frontend */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Current images (shown on homepage)</CardTitle>
            <CardDescription>
              These are the images currently displayed in the About Us section on the frontend.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => load(true)}>
            Refresh list
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Main image</Label>
              <div className="relative w-full h-48 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
                {mainImageUrl ? (
                  <>
                    <img
                      src={mainImageUrl}
                      alt="Current main"
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
                  <span className="text-sm text-gray-500">No main image set</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Overlapping image</Label>
              <div className="relative w-full h-48 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
                {overlappingImageUrl ? (
                  <>
                    <img
                      src={overlappingImageUrl}
                      alt="Current overlapping"
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
                  <span className="text-sm text-gray-500">No overlapping image set</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload new images</CardTitle>
          <CardDescription>
            Choose a file to replace. Leave empty to keep current. JPG/PNG, max 5MB each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Main image</Label>
                {(mainImageUrl || mainFile) && (
                  <div className="relative w-full h-40 rounded border bg-gray-100 overflow-hidden">
                    <img
                      src={mainFile ? URL.createObjectURL(mainFile) : mainImageUrl!}
                      alt="Main preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => setMainFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Overlapping image</Label>
                {(overlappingImageUrl || overlapFile) && (
                  <div className="relative w-full h-40 rounded border bg-gray-100 overflow-hidden">
                    <img
                      src={overlapFile ? URL.createObjectURL(overlapFile) : overlappingImageUrl!}
                      alt="Overlap preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => setOverlapFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <Button type="submit" disabled={saving || (!mainFile && !overlapFile)}>
              {saving ? 'Saving...' : 'Save images'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
