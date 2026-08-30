/** Old checkout stamped this Delhi-center pin on every typed address. */
export const PLACEHOLDER_COORDS = { lat: 28.6139, lng: 77.209 };

export function isPlaceholderCoords(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return true;
  return (
    Math.abs(lat - PLACEHOLDER_COORDS.lat) < 0.0005 &&
    Math.abs(lng - PLACEHOLDER_COORDS.lng) < 0.0005
  );
}

export function getBrowserLocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  });
}

async function geocodeNominatim(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'in');
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { lat: string; lon: string }[];
  if (!data?.[0]?.lat) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

/** GPS first, then geocode the typed address. Never silently use Delhi-center. */
export async function resolveJobCoords(opts: {
  address: string;
  lat?: number | null;
  lng?: number | null;
  preferGps?: boolean;
}): Promise<{ lat: number; lng: number }> {
  if (opts.preferGps !== false) {
    const gps = await getBrowserLocation();
    if (gps) return gps;
  }
  if (!isPlaceholderCoords(opts.lat, opts.lng) && opts.lat != null && opts.lng != null) {
    return { lat: opts.lat, lng: opts.lng };
  }
  const geocoded = await geocodeNominatim(opts.address).catch(() => null);
  if (geocoded) return geocoded;
  if (opts.lat != null && opts.lng != null) return { lat: opts.lat, lng: opts.lng };
  return PLACEHOLDER_COORDS;
}
