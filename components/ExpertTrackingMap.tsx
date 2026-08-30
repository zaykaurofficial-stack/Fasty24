'use client';

import { useEffect, useRef } from 'react';

type Point = { lat: number; lng: number };

type Props = {
  customer: Point;
  expert?: Point | null;
  etaMin?: number | null;
  distanceKm?: number | null;
  expertName?: string;
  route?: Point[];
};

type MapHandle = {
  setExpert: (p: Point) => void;
  setCustomer: (p: Point) => void;
  setRoute: (path: Point[]) => void;
  fit: (customer: Point, expert: Point | null | undefined, route: Point[]) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMap;
        Marker: new (opts: Record<string, unknown>) => GoogleMarker;
        Polyline: new (opts: Record<string, unknown>) => GooglePolyline;
        TrafficLayer: new () => { setMap: (map: GoogleMap | null) => void };
        LatLngBounds: new () => GoogleBounds;
      };
    };
    L?: LeafletNS;
  }
}

type GoogleMap = {
  fitBounds: (bounds: GoogleBounds, padding?: number) => void;
};
type GoogleMarker = {
  setPosition: (pos: Point) => void;
  setMap: (map: GoogleMap | null) => void;
};
type GooglePolyline = {
  setPath: (path: Point[]) => void;
  setMap: (map: GoogleMap | null) => void;
};
type GoogleBounds = {
  extend: (pos: Point) => void;
};

type LeafletNS = {
  map: (el: HTMLElement, opts?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, opts?: Record<string, unknown>) => { addTo: (m: LeafletMap) => void };
  circleMarker: (latlng: [number, number], opts?: Record<string, unknown>) => LeafletMarker;
  polyline: (latlngs: [number, number][], opts?: Record<string, unknown>) => LeafletLine;
  latLngBounds: (latlngs: [number, number][]) => { pad: (n: number) => unknown };
};

type LeafletMap = {
  setView: (latlng: [number, number], zoom: number) => LeafletMap;
  fitBounds: (b: unknown, opts?: Record<string, unknown>) => void;
  invalidateSize: () => void;
  remove: () => void;
};
type LeafletMarker = {
  setLatLng: (latlng: [number, number]) => void;
  addTo: (m: LeafletMap) => LeafletMarker;
};
type LeafletLine = {
  setLatLngs: (latlngs: [number, number][]) => void;
  addTo: (m: LeafletMap) => LeafletLine;
  remove: () => void;
};

let googleLoader: Promise<NonNullable<Window['google']>['maps']> | null = null;
let leafletLoader: Promise<LeafletNS> | null = null;

function googleKey() {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim();
}

function loadGoogleMapsJs() {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleLoader) return googleLoader;
  const key = googleKey();
  if (!key) return Promise.reject(new Error('missing_maps_key'));

  googleLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-fasty24-maps]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.google?.maps) resolve(window.google.maps);
        else reject(new Error('maps_unavailable'));
      });
      existing.addEventListener('error', () => reject(new Error('maps_script_failed')));
      return;
    }
    const script = document.createElement('script');
    script.dataset.fasty24Maps = '1';
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=quarterly`;
    script.onload = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error('maps_unavailable'));
    };
    script.onerror = () => reject(new Error('maps_script_failed'));
    document.head.appendChild(script);
  });
  return googleLoader;
}

function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    const href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-fasty24-leaflet]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.L) resolve(window.L);
        else reject(new Error('leaflet_unavailable'));
      });
      existing.addEventListener('error', () => reject(new Error('leaflet_failed')));
      return;
    }
    const script = document.createElement('script');
    script.dataset.fasty24Leaflet = '1';
    script.async = true;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error('leaflet_unavailable'));
    };
    script.onerror = () => reject(new Error('leaflet_failed'));
    document.head.appendChild(script);
  });
  return leafletLoader;
}

function createGoogleMap(el: HTMLElement, customer: Point, expert: Point | null | undefined, expertName?: string, route: Point[] = []): Promise<MapHandle> {
  return loadGoogleMapsJs().then((maps) => {
    const map = new maps.Map(el, {
      center: { lat: expert?.lat ?? customer.lat, lng: expert?.lng ?? customer.lng },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      keyboardShortcuts: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy',
    });
    new maps.TrafficLayer().setMap(map);
    const customerMarker = new maps.Marker({ map, position: customer, title: 'You' });
    let expertMarker: GoogleMarker | null = expert
      ? new maps.Marker({ map, position: expert, title: expertName || 'Expert' })
      : null;
    let line: GooglePolyline | null =
      route.length > 1
        ? new maps.Polyline({ map, path: route, strokeColor: '#FFC400', strokeWeight: 5 })
        : null;

    return {
      setCustomer: (p) => customerMarker.setPosition(p),
      setExpert: (p) => {
        if (expertMarker) expertMarker.setPosition(p);
        else expertMarker = new maps.Marker({ map, position: p, title: expertName || 'Expert' });
      },
      setRoute: (path) => {
        if (path.length < 2) return;
        if (line) line.setPath(path);
        else line = new maps.Polyline({ map, path, strokeColor: '#FFC400', strokeWeight: 5 });
      },
      fit: (c, e, path) => {
        if (!e) return;
        const bounds = new maps.LatLngBounds();
        if (path.length > 1) path.forEach((pt) => bounds.extend(pt));
        else {
          bounds.extend(c);
          bounds.extend(e);
        }
        map.fitBounds(bounds, 48);
      },
      destroy: () => {
        customerMarker.setMap(null);
        expertMarker?.setMap(null);
        line?.setMap(null);
      },
    };
  });
}

function createOsmMap(el: HTMLElement, customer: Point, expert: Point | null | undefined, route: Point[] = []): Promise<MapHandle> {
  return loadLeaflet().then((L) => {
    const start = expert ?? customer;
    const map = L.map(el, { zoomControl: true, attributionControl: true }).setView(
      [start.lat, start.lng],
      15,
    );
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const customerMarker = L.circleMarker([customer.lat, customer.lng], {
      radius: 8,
      color: '#0D0D0D',
      weight: 2,
      fillColor: '#FFC400',
      fillOpacity: 1,
    }).addTo(map);

    let expertMarker: LeafletMarker | null = expert
      ? L.circleMarker([expert.lat, expert.lng], {
          radius: 9,
          color: '#FFC400',
          weight: 2,
          fillColor: '#2563eb',
          fillOpacity: 1,
        }).addTo(map)
      : null;

    let line: LeafletLine | null =
      route.length > 1
        ? L.polyline(
            route.map((p) => [p.lat, p.lng] as [number, number]),
            { color: '#FFC400', weight: 5 },
          ).addTo(map)
        : null;

    requestAnimationFrame(() => map.invalidateSize());

    return {
      setCustomer: (p) => customerMarker.setLatLng([p.lat, p.lng]),
      setExpert: (p) => {
        if (expertMarker) expertMarker.setLatLng([p.lat, p.lng]);
        else {
          expertMarker = L.circleMarker([p.lat, p.lng], {
            radius: 9,
            color: '#FFC400',
            weight: 2,
            fillColor: '#2563eb',
            fillOpacity: 1,
          }).addTo(map);
        }
      },
      setRoute: (path) => {
        if (path.length < 2) return;
        const latlngs = path.map((p) => [p.lat, p.lng] as [number, number]);
        if (line) line.setLatLngs(latlngs);
        else line = L.polyline(latlngs, { color: '#FFC400', weight: 5 }).addTo(map);
      },
      fit: (c, e, path) => {
        const pts: [number, number][] =
          path.length > 1
            ? path.map((p) => [p.lat, p.lng])
            : e
              ? [
                  [c.lat, c.lng],
                  [e.lat, e.lng],
                ]
              : [[c.lat, c.lng]];
        map.fitBounds(L.latLngBounds(pts).pad(0.25), { animate: false, padding: [36, 36] });
        map.invalidateSize();
      },
      destroy: () => map.remove(),
    };
  });
}

export default function ExpertTrackingMap({
  customer,
  expert,
  etaMin,
  distanceKm,
  expertName,
  route = [],
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<MapHandle | null>(null);
  const didFit = useRef(false);
  const useGoogle = Boolean(googleKey());

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    let cancelled = false;

    const create = useGoogle
      ? createGoogleMap(el, customer, expert, expertName, route)
      : createOsmMap(el, customer, expert, route);

    create
      .then((handle) => {
        if (cancelled) {
          handle.destroy();
          return;
        }
        handleRef.current = handle;
        if (expert) {
          handle.fit(customer, expert, route);
          didFit.current = true;
        }
      })
      .catch(() => {
        handleRef.current = null;
      });

    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // Map instance is created once; live updates go through the second effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useGoogle]);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    handle.setCustomer(customer);
    if (expert) handle.setExpert(expert);
    if (route.length > 1) handle.setRoute(route);
    if (!didFit.current && expert) {
      handle.fit(customer, expert, route);
      didFit.current = true;
    }
  }, [customer, expert, route]);

  const etaLabel =
    etaMin != null ? `Arriving in ~${Math.max(1, Math.round(etaMin))} min` : 'Expert on the way';
  const distLabel = distanceKm != null ? `${distanceKm.toFixed(1)} km away` : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#141414]">
      <div ref={hostRef} className="h-64 w-full bg-white/5 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:bg-[#1a1a1a]" />
      <div className="pointer-events-none absolute left-3 right-3 bottom-3 rounded-xl bg-black/85 px-4 py-3">
        <p className="font-extrabold text-fasty-yellow">{etaLabel}</p>
        {distLabel && <p className="text-xs text-white/80 mt-0.5">{distLabel}</p>}
      </div>
    </div>
  );
}
