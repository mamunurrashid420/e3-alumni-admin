import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface PhotoViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  alt?: string;
}

export function PhotoViewer({ open, onOpenChange, src, alt = '' }: PhotoViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-auto max-h-[90vh] p-4 flex items-center justify-center">
        {src && (
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
