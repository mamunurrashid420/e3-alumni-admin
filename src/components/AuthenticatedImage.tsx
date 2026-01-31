interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

/**
 * Renders an image from a signed URL. The API returns temporary signed URLs
 * for file fields (photo, signature, etc.), so no Bearer token is needed –
 * the URL itself is the credential. Use a plain img for direct display.
 */
export function AuthenticatedImage({ src, alt, className, onError }: AuthenticatedImageProps) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-gray-500 text-sm">No image</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={onError} />;
}
