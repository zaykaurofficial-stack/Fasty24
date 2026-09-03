export type TrackPoint = { lat: number; lng: number };

export function headingDeg(from: TrackPoint, to: TrackPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function dist2(a: TrackPoint, b: TrackPoint) {
  const dLat = a.lat - b.lat;
  const dLng = a.lng - b.lng;
  return dLat * dLat + dLng * dLng;
}

function nearestIndex(route: TrackPoint[], point: TrackPoint) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < route.length; i++) {
    const d = dist2(route[i], point);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Same locked path ahead of the bike (do not invent a new geometry). */
export function remainingRoute(route: TrackPoint[], expert: TrackPoint, customer: TrackPoint) {
  if (!route || route.length < 2) return [expert, customer];
  const i = nearestIndex(route, expert);
  const rest = route.slice(Math.max(0, i));
  if (rest.length < 2) return [...rest, customer];
  return rest;
}

/** Path already covered. */
export function traveledRoute(route: TrackPoint[], expert: TrackPoint) {
  if (!route || route.length < 2) return [];
  const i = nearestIndex(route, expert);
  if (i < 1) return [];
  return route.slice(0, i + 1);
}

/** Prefer a previously locked path unless the server says it changed. */
export function lockRoute(
  previous: TrackPoint[] | undefined,
  next: TrackPoint[] | undefined,
  routeChanged?: boolean,
): TrackPoint[] {
  if (routeChanged && next && next.length > 1) return next;
  if (previous && previous.length > 1) return previous;
  if (next && next.length > 1) return next;
  return previous || next || [];
}

export const CLEAN_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f1f3f4' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e6f4ea' }, { visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e5e7eb' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#d1d5db' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] },
  { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

export const ROUTE_BLUE = '#2563EB';
