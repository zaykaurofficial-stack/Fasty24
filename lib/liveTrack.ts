export type TrackPoint = { lat: number; lng: number };

/** A real road path — never a 2-point straight A→B line. */
const MIN_ROAD_POINTS = 3;

export function isRoadRoute(route?: TrackPoint[] | null): boolean {
  return Array.isArray(route) && route.length >= MIN_ROAD_POINTS;
}

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

/**
 * Same locked road path ahead of the bike.
 * Returns [] when we don't have a real road polyline — never invent a straight line.
 */
export function remainingRoute(route: TrackPoint[], expert: TrackPoint, _customer?: TrackPoint) {
  if (!isRoadRoute(route)) return [];
  const i = nearestIndex(route, expert);
  const rest = route.slice(Math.max(0, i));
  return rest.length >= 2 ? rest : [];
}

/** Path already covered. */
export function traveledRoute(route: TrackPoint[], expert: TrackPoint) {
  if (!isRoadRoute(route)) return [];
  const i = nearestIndex(route, expert);
  if (i < 1) return [];
  return route.slice(0, i + 1);
}

/** Prefer a previously locked road path unless the server says it changed. */
export function lockRoute(
  previous: TrackPoint[] | undefined,
  next: TrackPoint[] | undefined,
  routeChanged?: boolean,
): TrackPoint[] {
  if (routeChanged && isRoadRoute(next)) return next!;
  if (isRoadRoute(previous)) return previous!;
  if (isRoadRoute(next)) return next!;
  return [];
}

/** Clean muted map style — roads light, no clutter, no transit/traffic feel. */
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
