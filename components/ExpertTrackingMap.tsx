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

let mapsLoader: Promise<NonNullable<Window['google']>['maps']> | null = null;

function mapsKey() {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim();
}

function loadGoogleMapsJs() {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (mapsLoader) return mapsLoader;
  const key = mapsKey();
  if (!key) return Promise.reject(new Error('missing_maps_key'));

  mapsLoader = new Promise((resolve, reject) => {
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
  return mapsLoader;
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
  const mapRef = useRef<GoogleMap | null>(null);
  const customerMarker = useRef<GoogleMarker | null>(null);
  const expertMarker = useRef<GoogleMarker | null>(null);
  const lineRef = useRef<GooglePolyline | null>(null);
  const didFit = useRef(false);
  const key = mapsKey();

  useEffect(() => {
    if (!key || !hostRef.current) return undefined;
    let cancelled = false;

    loadGoogleMapsJs()
      .then((maps) => {
        if (cancelled || !hostRef.current || mapRef.current) return;
        const map = new maps.Map(hostRef.current, {
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
        mapRef.current = map;
        new maps.TrafficLayer().setMap(map);
        customerMarker.current = new maps.Marker({
          map,
          position: customer,
          title: 'You',
        });
        if (expert) {
          expertMarker.current = new maps.Marker({
            map,
            position: expert,
            title: expertName || 'Expert',
          });
        }
        if (route.length > 1) {
          lineRef.current = new maps.Polyline({
            map,
            path: route,
            strokeColor: '#FFC400',
            strokeWeight: 5,
          });
        }
      })
      .catch((err) => {
        console.warn('[google-maps]', err?.message || err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    customerMarker.current?.setPosition(customer);
    if (expert) {
      if (expertMarker.current) {
        expertMarker.current.setPosition(expert);
      } else if (mapRef.current && window.google?.maps) {
        expertMarker.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: expert,
          title: expertName || 'Expert',
        });
      }
    }
    if (route.length > 1 && window.google?.maps && mapRef.current) {
      if (lineRef.current) {
        lineRef.current.setPath(route);
      } else {
        lineRef.current = new window.google.maps.Polyline({
          map: mapRef.current,
          path: route,
          strokeColor: '#FFC400',
          strokeWeight: 5,
        });
      }
    }
    if (!didFit.current && mapRef.current && window.google?.maps && expert) {
      const bounds = new window.google.maps.LatLngBounds();
      if (route.length > 1) route.forEach((p) => bounds.extend(p));
      else {
        bounds.extend(customer);
        bounds.extend(expert);
      }
      mapRef.current.fitBounds(bounds, 48);
      didFit.current = true;
    }
  }, [customer, expert, expertName, route]);

  const etaLabel =
    etaMin != null ? `Arriving in ~${Math.max(1, Math.round(etaMin))} min` : 'Expert on the way';
  const distLabel = distanceKm != null ? `${distanceKm.toFixed(1)} km away` : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#141414]">
      <div ref={hostRef} className="h-64 w-full bg-white/5" />
      <div className="pointer-events-none absolute left-3 right-3 bottom-3 rounded-xl bg-black/85 px-4 py-3">
        <p className="font-extrabold text-fasty-yellow">{etaLabel}</p>
        {distLabel && <p className="text-xs text-white/80 mt-0.5">{distLabel}</p>}
        {!key && (
          <p className="text-[11px] text-gray-500 mt-1">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and restart the web app to load Google Maps.
          </p>
        )}
      </div>
    </div>
  );
}
