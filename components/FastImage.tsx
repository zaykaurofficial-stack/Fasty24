'use client';

import { useEffect, useRef, useState } from 'react';
import { optimizeImageUrl, type ImageSize } from '@/lib/image';

interface FastImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  size?: ImageSize;
  fit?: 'cover' | 'contain';
  priority?: boolean;
}

/**
 * Card/hero image that paints immediately: a tiny blurred Cloudinary
 * placeholder, then the sized WebP/AVIF. Cached images skip the fade.
 */
export default function FastImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  size = 'card',
  fit = 'cover',
  priority = false,
}: FastImageProps) {
  const resolvedSize: ImageSize = fit === 'contain' && size === 'card' ? 'contain' : size;
  const displaySrc = optimizeImageUrl(src, resolvedSize);
  const blurSrc = optimizeImageUrl(src, 'blur');
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, [displaySrc]);

  if (!displaySrc) return null;

  const objectFit = fit === 'contain' ? 'object-contain' : 'object-cover object-center';

  return (
    <div className={`relative overflow-hidden bg-[#1a1a1a] ${className}`}>
      {blurSrc && blurSrc !== displaySrc && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover scale-110 ${
            fit === 'contain' ? 'blur-2xl opacity-50' : 'blur-md'
          }`}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={`relative z-[1] w-full h-full ${objectFit} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  );
}
