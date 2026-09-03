import { accentFor } from '@/lib/content';
import FastImage from '@/components/FastImage';

interface ServiceImageProps {
  src?: string;
  alt: string;
  icon?: string;
  accentSlug?: string;
  className?: string;
  rounded?: string;
  showPlaceholderLabel?: boolean;
  /** 'cover' crops to fill, 'contain' shows the full image with a blurred fill behind it. */
  fit?: 'cover' | 'contain';
  priority?: boolean;
  size?: 'thumb' | 'card' | 'contain' | 'hero' | 'full';
}

/**
 * Renders a remote image (admin-uploaded / Cloudinary) with a graceful branded
 * placeholder when no image has been added yet.
 */
export default function ServiceImage({
  src,
  alt,
  icon,
  accentSlug,
  className = '',
  rounded = 'rounded-2xl',
  showPlaceholderLabel = false,
  fit = 'cover',
  priority = false,
  size = fit === 'contain' ? 'full' : 'card',
}: ServiceImageProps) {
  if (src) {
    return (
      <FastImage
        src={src}
        alt={alt}
        size={size}
        fit={fit}
        priority={priority}
        className={`w-full h-full ${rounded} ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br ${accentFor(
        accentSlug,
      )} ${rounded} ${className}`}
    >
      <span className="text-4xl opacity-80">{icon || '🛠️'}</span>
      {showPlaceholderLabel && (
        <span className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-fasty-black/40">
          Photo coming soon
        </span>
      )}
    </div>
  );
}
