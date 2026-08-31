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

/** Path still ahead of the bike (expert → customer). */
export function remainingRoute(route: TrackPoint[], expert: TrackPoint, customer: TrackPoint) {
  if (!route || route.length < 2) return [expert, customer];
  const i = nearestIndex(route, expert);
  const rest = route.slice(i);
  if (rest.length < 2) return [expert, customer];
  return [expert, ...rest.slice(1)];
}

/** Path already covered. */
export function traveledRoute(route: TrackPoint[], expert: TrackPoint) {
  if (!route || route.length < 2) return [];
  const i = nearestIndex(route, expert);
  if (i < 1) return [];
  return [...route.slice(0, i), expert];
}
