import { accentFor } from '@/lib/content';

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
}

/**
 * Renders a remote image (admin-uploaded / Cloudinary) with a graceful branded
 * placeholder when no image has been added yet. Uses a plain <img> so any image
 * host works without Next remotePatterns configuration.
 *
 * With fit="contain" the full image is always visible (never cropped) and the
 * surrounding space is filled with a blurred copy of the same image, so there is
 * no empty/blank area.
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
}: ServiceImageProps) {
  if (src) {
    if (fit === 'contain') {
      return (
        <div className={`relative overflow-hidden bg-fasty-light ${rounded} ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
            loading="lazy"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="relative z-10 w-full h-full object-contain" loading="lazy" />
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`object-cover object-center ${rounded} ${className}`}
        loading="lazy"
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
