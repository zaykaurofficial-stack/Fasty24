export type ImageSize = 'blur' | 'thumb' | 'card' | 'hero' | 'avatar' | 'full';

const WIDTH: Record<ImageSize, number> = {
  blur: 32,
  thumb: 200,
  card: 720,
  hero: 1280,
  avatar: 96,
  full: 1400,
};

const CLOUDINARY: Record<ImageSize, string> = {
  blur: 'f_auto,q_auto:low,w_32,e_blur:400,c_limit',
  thumb: 'f_auto,q_auto,w_200,c_fill,g_auto',
  card: 'f_auto,q_auto,w_720,c_fill,g_auto',
  hero: 'f_auto,q_auto,w_1280,c_fill,g_auto',
  avatar: 'f_auto,q_auto,w_96,h_96,c_fill,g_face',
  full: 'f_auto,q_auto,w_1400,c_limit',
};

const OUR_TRANSFORM = /^f_auto,[^/]+\//;

export function optimizeImageUrl(url?: string | null, size: ImageSize = 'card'): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return withCloudinaryTransform(url, CLOUDINARY[size]);
  }
  if (url.includes('images.unsplash.com')) {
    return withUnsplash(url, size);
  }
  return url;
}

function withCloudinaryTransform(url: string, transform: string): string {
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const head = url.slice(0, idx + marker.length);
  let rest = url.slice(idx + marker.length);
  rest = rest.replace(OUR_TRANSFORM, '');
  return `${head}${transform}/${rest}`;
}

function withUnsplash(url: string, size: ImageSize): string {
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(WIDTH[size]));
    u.searchParams.set('q', size === 'blur' ? '10' : '70');
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', size === 'full' || size === 'blur' ? 'max' : 'crop');
    return u.toString();
  } catch {
    return url;
  }
}

export function catalogImageUrls(
  categories: Array<{ imageUrl?: string; services?: Array<{ imageUrl?: string }> }>,
): string[] {
  const urls: string[] = [];
  for (const cat of categories) {
    if (cat.imageUrl) urls.push(cat.imageUrl);
    for (const svc of cat.services ?? []) {
      if (svc.imageUrl) urls.push(svc.imageUrl);
    }
  }
  return urls;
}

export function prefetchImages(urls: Array<string | undefined | null>, size: ImageSize = 'card') {
  if (typeof window === 'undefined') return;
  const seen = new Set<string>();
  for (const url of urls) {
    const src = optimizeImageUrl(url, size);
    if (!src || seen.has(src)) continue;
    seen.add(src);
    const img = new window.Image();
    img.decoding = 'async';
    img.src = src;
    const blur = optimizeImageUrl(url, 'blur');
    if (blur && blur !== src && !seen.has(blur)) {
      seen.add(blur);
      const tiny = new window.Image();
      tiny.src = blur;
    }
  }
}
