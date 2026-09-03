'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CLEAN_MAP_STYLE,
  ROUTE_BLUE,
  headingDeg,
  lockRoute,
  remainingRoute,
  type TrackPoint as Point,
} from '@/lib/liveTrack';

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
        OverlayView: new () => GoogleOverlay;
        LatLng: new (lat: number, lng: number) => unknown;
        LatLngBounds: new () => GoogleBounds;
        Size: new (w: number, h: number) => unknown;
        Point: new (x: number, y: number) => unknown;
        event: { addListenerOnce: (map: GoogleMap, name: string, fn: () => void) => void };
      };
    };
    gm_authFailure?: () => void;
    __fasty24MapsInit?: () => void;
  }
}

type GoogleMap = {
  fitBounds: (bounds: GoogleBounds, padding?: number | Record<string, number>) => void;
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
type GoogleOverlay = {
  setMap: (map: GoogleMap | null) => void;
  onAdd?: () => void;
  draw?: () => void;
  onRemove?: () => void;
  getPanes: () => { overlayMouseTarget?: HTMLElement } | null;
  getProjection: () => {
    fromLatLngToDivPixel: (latLng: unknown) => { x: number; y: number } | null;
  } | null;
};

type BikeHandle = {
  setPosition: (p: Point) => void;
  setHeading: (deg: number) => void;
  remove: () => void;
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
      if (window.google?.maps) return resolve(window.google.maps);
      existing.addEventListener('load', () => {
        if (window.google?.maps) resolve(window.google.maps);
        else reject(new Error('maps_unavailable'));
      });
      existing.addEventListener('error', () => reject(new Error('maps_script_failed')));
      return;
    }

    window.__fasty24MapsInit = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error('maps_unavailable'));
    };

    const script = document.createElement('script');
    script.dataset.fasty24Maps = '1';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__fasty24MapsInit`;
    script.onerror = () => reject(new Error('maps_script_failed'));
    document.head.appendChild(script);
  });

  return mapsLoader;
}

const DEST_ICON =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <circle cx="22" cy="22" r="16" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
      <path d="M22 11c-4.4 0-8 3.6-8 8 0 5.5 8 14 8 14s8-8.5 8-14c0-4.4-3.6-8-8-8z" fill="#16A34A"/>
      <circle cx="22" cy="19" r="3.2" fill="#ffffff"/>
    </svg>`,
  );

function makeBikeEl() {
  const wrap = document.createElement('div');
  wrap.style.position = 'absolute';
  wrap.style.transform = 'translate(-50%, -50%)';
  wrap.style.zIndex = '2';
  wrap.style.pointerEvents = 'none';
  wrap.innerHTML = `
    <div data-bike style="width:52px;height:52px;border-radius:50%;background:#16A34A;border:3px solid #ffffff;box-shadow:0 6px 16px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:26px;line-height:1;transition:transform .25s linear">
      🛵
    </div>`;
  return wrap;
}

function attachBikeOverlay(
  maps: NonNullable<Window['google']>['maps'],
  map: GoogleMap,
  start: Point,
): BikeHandle {
  const el = makeBikeEl();
  const inner = el.querySelector('[data-bike]') as HTMLElement | null;
  let position = start;

  const overlay = new maps.OverlayView();
  overlay.onAdd = () => {
    const target = overlay.getPanes()?.overlayMouseTarget;
    if (target) target.appendChild(el);
  };
  overlay.draw = () => {
    const proj = overlay.getProjection();
    if (!proj) return;
    const p = proj.fromLatLngToDivPixel(new maps.LatLng(position.lat, position.lng));
    if (!p) return;
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
  };
  overlay.onRemove = () => el.remove();
  overlay.setMap(map);

  return {
    setPosition: (p) => {
      position = p;
      overlay.draw?.();
    },
    setHeading: (deg) => {
      if (inner) inner.style.transform = `rotate(${deg}deg)`;
    },
    remove: () => overlay.setMap(null),
  };
}

function animateBike(handle: BikeHandle, from: Point, to: Point, heading: number, ms = 900) {
  const t0 = performance.now();
  handle.setHeading(heading);
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / ms);
    const ease = 1 - (1 - t) * (1 - t);
    handle.setPosition({
      lat: from.lat + (to.lat - from.lat) * ease,
      lng: from.lng + (to.lng - from.lng) * ease,
    });
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const AUTH_HELP =
  'Google Maps JavaScript API rejected this key. Enable Maps JavaScript API and use a browser key restricted by HTTP referrers.';

export default function ExpertTrackingMap({
  customer,
  expert,
  etaMin,
  distanceKm,
  expertName,
  route = [],
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const destMarker = useRef<GoogleMarker | null>(null);
  const remainLine = useRef<GooglePolyline | null>(null);
  const remainOutline = useRef<GooglePolyline | null>(null);
  const doneLine = useRef<GooglePolyline | null>(null);
  const bikeRef = useRef<BikeHandle | null>(null);
  const lastExpert = useRef<Point | null>(null);
  const headingRef = useRef(0);
  const didFit = useRef(false);
  const lockedRouteRef = useRef<Point[]>([]);
  const key = mapsKey();
  const [authError, setAuthError] = useState<string | null>(null);

  const lockedRoute = useMemo(() => {
    const next = lockRoute(lockedRouteRef.current, route, route.length > 1);
    lockedRouteRef.current = next;
    return next;
  }, [route]);

  useEffect(() => {
    window.gm_authFailure = () => setAuthError(AUTH_HELP);
    return () => {
      if (window.gm_authFailure) delete window.gm_authFailure;
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!key || !wrap) return undefined;
    let cancelled = false;
    const host = document.createElement('div');
    host.style.width = '100%';
    host.style.height = '100%';
    wrap.replaceChildren(host);

    loadGoogleMapsJs()
      .then((maps) => {
        if (cancelled || !host.isConnected) return;
        const map = new maps.Map(host, {
          center: { lat: expert?.lat ?? customer.lat, lng: expert?.lng ?? customer.lng },
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          keyboardShortcuts: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          styles: CLEAN_MAP_STYLE,
        });
        mapRef.current = map;

        destMarker.current = new maps.Marker({
          map,
          position: customer,
          title: 'Your location',
          zIndex: 1,
          icon: {
            url: DEST_ICON,
            scaledSize: new maps.Size(40, 48),
            anchor: new maps.Point(20, 40),
          },
        });

        remainOutline.current = new maps.Polyline({
          map,
          path: [],
          strokeColor: '#ffffff',
          strokeOpacity: 1,
          strokeWeight: 10,
        });
        remainLine.current = new maps.Polyline({
          map,
          path: [],
          strokeColor: ROUTE_BLUE,
          strokeWeight: 6,
          strokeOpacity: 1,
        });
        doneLine.current = new maps.Polyline({
          map,
          path: [],
          strokeColor: ROUTE_BLUE,
          strokeWeight: 6,
          strokeOpacity: 0.18,
        });

        if (expert) {
          bikeRef.current = attachBikeOverlay(maps, map, expert);
          lastExpert.current = expert;
        }

        maps.event.addListenerOnce(map, 'tilesloaded', () => {
          if (!cancelled) setAuthError(null);
        });
      })
      .catch((err) => {
        console.warn('[google-maps]', err?.message || err);
        if (!cancelled) setAuthError(AUTH_HELP);
      });

    return () => {
      cancelled = true;
      bikeRef.current?.remove();
      bikeRef.current = null;
      mapRef.current = null;
      destMarker.current = null;
      remainLine.current = null;
      remainOutline.current = null;
      doneLine.current = null;
      wrap.replaceChildren();
    };
  }, [customer.lat, customer.lng, expert?.lat, expert?.lng, key]);

  useEffect(() => {
    destMarker.current?.setPosition(customer);
    const maps = window.google?.maps;
    const map = mapRef.current;
    if (!maps || !map) return;

    if (expert) {
      if (!bikeRef.current) {
        bikeRef.current = attachBikeOverlay(maps, map, expert);
        lastExpert.current = expert;
      } else {
        const from = lastExpert.current || expert;
        const moved = from.lat !== expert.lat || from.lng !== expert.lng;
        if (moved) {
          headingRef.current = headingDeg(from, expert);
          animateBike(bikeRef.current, from, expert, headingRef.current);
          lastExpert.current = expert;
        }
      }

      const remain = remainingRoute(lockedRoute, expert, customer);
      const done =
        lockedRoute.length > remain.length ? lockedRoute.slice(0, lockedRoute.length - remain.length + 1) : [];
      remainOutline.current?.setPath(remain);
      remainLine.current?.setPath(remain);
      doneLine.current?.setPath(done);
    }

    if (!didFit.current && expert) {
      const bounds = new maps.LatLngBounds();
      const remain = remainingRoute(lockedRoute, expert, customer);
      remain.forEach((p) => bounds.extend(p));
      bounds.extend(customer);
      bounds.extend(expert);
      map.fitBounds(bounds, { top: 64, right: 48, bottom: 48, left: 48 });
      didFit.current = true;
    }
  }, [customer, expert, lockedRoute]);

  const etaLabel =
    etaMin != null
      ? `Arriving in ${Math.max(1, Math.round(etaMin))} minute${Math.round(etaMin) === 1 ? '' : 's'}`
      : 'Expert on the way';
  const distLabel = distanceKm != null ? `${distanceKm.toFixed(1)} km away` : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="bg-green-600 px-4 py-3 text-white">
        <p className="font-extrabold leading-tight">{etaLabel}</p>
        <p className="text-xs text-white/90 mt-0.5 truncate">
          {expertName ? `${expertName} is on the way` : 'Your expert is on the way'}
          {distLabel ? ` · ${distLabel}` : ''}
        </p>
      </div>
      <div ref={wrapRef} className="h-80 w-full bg-[#eef2f5] sm:h-96" />
      <div className="pointer-events-none absolute left-3 top-16 rounded-full bg-white/95 px-3 py-2 flex items-center gap-2 shadow-sm">
        <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center text-lg shrink-0">
          🛵
        </div>
        {!key && <p className="text-[11px] text-gray-500">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>}
        {authError && <p className="text-[11px] text-red-500 leading-snug">{authError}</p>}
      </div>
    </div>
  );
}
