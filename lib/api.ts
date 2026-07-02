function readPublicEnv(nextKey: string, expoKey: string, fallback: string): string {
  const value = process.env[nextKey] ?? process.env[expoKey];
  return value && value.trim() ? value.trim() : fallback;
}

// Same-origin /api/v1 is proxied by next.config.js rewrites — avoids CORS when
// opening the app via network IP (e.g. 192.168.x.x:3001) instead of localhost.
export const API_URL = readPublicEnv(
  'NEXT_PUBLIC_API_URL',
  'EXPO_PUBLIC_API_URL',
  '/api/v1',
);
export const SOCKET_URL = readPublicEnv(
  'NEXT_PUBLIC_SOCKET_URL',
  'EXPO_PUBLIC_SOCKET_URL',
  'http://localhost:3000',
);

export const theme = {
  yellow: '#FFC400',
  black: '#0D0D0D',
  white: '#FFFFFF',
  gray: '#6B7280',
  light: '#F9FAFB',
};

/* ------------------------------------------------------------------ */
/* Types (mirror the backend serializers)                             */
/* ------------------------------------------------------------------ */

export interface ProcessStep {
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  categories: string[];
  skillTag: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  process: ProcessStep[];
  inclusions: string[];
  exclusions: string[];
  faqs: ServiceFaq[];
  durationMin: number;
  price: number;
  addOnEligible: boolean;
  serviceKind: 'timed' | 'standard' | 'addon_only';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  sortOrder: number;
  supportsScheduling: boolean;
  supportsTimedJob: boolean;
  active: boolean;
  services?: Service[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface Principal {
  id: string;
  phone: string;
  name: string;
  gender?: string;
  dateOfBirth?: string | null;
  email?: string;
  addresses?: Address[];
  profileComplete?: boolean;
  role?: string;
}

export interface BookingItem {
  id: string;
  name: string;
  skillTag: string;
  durationMin: number;
  price: number;
  isAddOn: boolean;
}

export interface BookingExpert {
  id: string;
  name: string;
  rating: number;
  photoUrl: string;
  phone: string;
  lastLocation?: { lat: number | null; lng: number | null; updatedAt?: string | null };
}

export type BookingStatus =
  | 'created'
  | 'scheduled'
  | 'searching'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  status: BookingStatus;
  bookingType: 'instant' | 'scheduled';
  cancelReason?: string | null;
  items: BookingItem[];
  location: { address: string; lat: number; lng: number; zoneSlug?: string };
  quotedEtaMin?: number | null;
  distanceKm?: number | null;
  pricing: { subtotal: number; tax: number; discount: number; total: number; currency: string };
  payment: { status: string; method?: string; providerRef?: string };
  timeline: {
    createdAt?: string;
    assignedAt?: string | null;
    arrivedAt?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
  };
  rating?: { stars: number | null; comment: string };
  sessionOtp?: {
    startVerified: boolean;
    endVerified: boolean;
    requiresStartOtp: boolean;
    requiresEndOtp: boolean;
    startCode?: string | null;
    endCode?: string | null;
  } | null;
  scheduledFor?: string | null;
  scheduledSlot?: { slotId: string; window: string; date: string } | null;
  expert?: BookingExpert | null;
  customer?: { id: string; name: string; phone: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Slot {
  slotId: string;
  date: string;
  window: string;
  windowStart: string;
  windowEnd: string;
  available: boolean;
  remaining: number;
}

export interface SlotResponse {
  zoneSlug: string;
  serviceSlug: string;
  slots: Slot[];
}

/* ------------------------------------------------------------------ */
/* Auth storage                                                       */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = 'fasty_token';
const USER_KEY = 'fasty_user';
const ADMIN_TOKEN_KEY = 'fasty_admin_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: Principal) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): Principal | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as Principal) : null;
}

export function getAuthToken(): string | null {
  return getToken();
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/* ------------------------------------------------------------------ */
/* Fetch helpers                                                      */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

interface FetchOpts extends RequestInit {
  token?: string | null;
  admin?: boolean;
}

async function apiFetch<T>(path: string, options: FetchOpts = {}): Promise<T> {
  const { admin, token: tokenOverride, ...rest } = options;
  const token = tokenOverride ?? (admin ? getAdminToken() : getToken());
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || body.message || 'request_failed', res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function apiUpload<T>(path: string, formData: FormData, admin = true): Promise<T> {
  const token = admin ? getAdminToken() : getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', body: formData, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || 'upload_failed', res.status);
  }
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export interface RequestOtpResponse {
  ok: boolean;
  devCode?: string;
  message?: string;
}

export function requestOtp(phone: string, role: 'customer' | 'expert' = 'customer') {
  return apiFetch<RequestOtpResponse>('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, role }),
  });
}

export interface VerifyOtpResponse {
  token?: string;
  role?: string;
  principal?: Principal;
  needsProfile?: boolean;
  isNew?: boolean;
  phone?: string;
  registrationToken?: string;
}

export function verifyOtp(phone: string, code: string, role: 'customer' | 'expert' = 'customer') {
  return apiFetch<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code, role }),
  });
}

export function completeProfile(
  registrationToken: string,
  data: { name: string; gender?: string; dateOfBirth?: string },
) {
  return apiFetch<VerifyOtpResponse>('/auth/complete-profile', {
    method: 'POST',
    token: registrationToken,
    body: JSON.stringify(data),
  });
}

export function getMe() {
  return apiFetch<{ role: string; principal: Principal; needsProfile: boolean }>('/me');
}

/* ------------------------------------------------------------------ */
/* Catalog                                                            */
/* ------------------------------------------------------------------ */

export function getCategories() {
  return apiFetch<Category[]>('/categories');
}

export function getServices(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<Service[]>(`/services${qs}`);
}

export function getService(idOrSlug: string) {
  return apiFetch<Service>(`/services/${encodeURIComponent(idOrSlug)}`);
}

/* ------------------------------------------------------------------ */
/* Slots                                                              */
/* ------------------------------------------------------------------ */

export function getSlots(params: { serviceId: string; date: string; lat: number; lng: number }) {
  const qs = new URLSearchParams({
    serviceId: params.serviceId,
    date: params.date,
    lat: String(params.lat),
    lng: String(params.lng),
  }).toString();
  return apiFetch<SlotResponse>(`/slots?${qs}`);
}

/* ------------------------------------------------------------------ */
/* Profile + addresses                                                */
/* ------------------------------------------------------------------ */

export function updateProfile(data: { name?: string; gender?: string; dateOfBirth?: string; email?: string }) {
  return apiFetch<{ ok: boolean }>('/me/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

export function addAddress(data: Partial<Address>) {
  return apiFetch<{ ok: boolean }>('/me/addresses', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAddress(addressId: string, data: Partial<Address>) {
  return apiFetch<{ ok: boolean }>(`/me/addresses/${addressId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAddress(addressId: string) {
  return apiFetch<{ ok: boolean }>(`/me/addresses/${addressId}`, { method: 'DELETE' });
}

export function setDefaultAddress(addressId: string) {
  return apiFetch<{ ok: boolean }>(`/me/addresses/${addressId}/default`, { method: 'POST' });
}

/* ------------------------------------------------------------------ */
/* Bookings                                                           */
/* ------------------------------------------------------------------ */

export interface CreateBookingInput {
  serviceIds: string[];
  location: { address: string; lat: number; lng: number };
  bookingType: 'instant' | 'scheduled';
  slotId?: string;
  date?: string;
}

export function createBooking(data: CreateBookingInput) {
  return apiFetch<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) });
}

export function getBookings() {
  return apiFetch<Booking[]>('/bookings');
}

export function getBooking(id: string) {
  return apiFetch<Booking>(`/bookings/${id}`);
}

export function cancelBooking(id: string, reason?: string) {
  return apiFetch<Booking>(`/bookings/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function confirmPayment(id: string, providerRef?: string) {
  return apiFetch<Booking>(`/bookings/${id}/payment`, {
    method: 'POST',
    body: JSON.stringify({ providerRef }),
  });
}

export function rateBooking(id: string, stars: number, comment?: string) {
  return apiFetch<Booking>(`/bookings/${id}/rate`, {
    method: 'POST',
    body: JSON.stringify({ stars, comment }),
  });
}

/* ------------------------------------------------------------------ */
/* Admin                                                              */
/* ------------------------------------------------------------------ */

export function adminLogin(password: string) {
  return apiFetch<{ token: string; role: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function adminGetServices() {
  return apiFetch<Service[]>('/admin/services', { admin: true });
}

export function adminCreateService(data: Partial<Service>) {
  return apiFetch<Service>('/admin/services', { admin: true, method: 'POST', body: JSON.stringify(data) });
}

export function adminUpdateService(id: string, data: Partial<Service>) {
  return apiFetch<Service>(`/admin/services/${id}`, {
    admin: true,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function adminDeleteService(id: string) {
  return apiFetch<{ ok: boolean }>(`/admin/services/${id}`, { admin: true, method: 'DELETE' });
}

export function adminGetCategories() {
  return apiFetch<Category[]>('/admin/categories', { admin: true });
}

export function adminCreateCategory(data: Partial<Category>) {
  return apiFetch<Category>('/admin/categories', {
    admin: true,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function adminUpdateCategory(id: string, data: Partial<Category>) {
  return apiFetch<Category>(`/admin/categories/${id}`, {
    admin: true,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function adminGetBookings() {
  return apiFetch<Booking[]>('/admin/bookings', { admin: true });
}

export function adminGetExperts() {
  return apiFetch<Record<string, unknown>[]>('/admin/experts', { admin: true });
}

export async function adminUploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append('file', file);
  return apiUpload<{ url: string; publicId: string }>('/admin/uploads', fd);
}

export async function adminUploadImages(files: File[]): Promise<{ images: { url: string; publicId: string }[] }> {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  return apiUpload<{ images: { url: string; publicId: string }[] }>('/admin/uploads/multiple', fd);
}

/* ------------------------------------------------------------------ */
/* Status helpers                                                     */
/* ------------------------------------------------------------------ */

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created: { label: 'Awaiting payment', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  searching: { label: 'Finding professional', color: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: 'Professional assigned', color: 'bg-amber-200 text-amber-900' },
  in_progress: { label: 'In progress', color: 'bg-fasty-black text-fasty-yellow' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export const ACTIVE_STATUSES: BookingStatus[] = ['searching', 'assigned', 'in_progress', 'scheduled'];

export function errorMessage(err: unknown): string {
  const map: Record<string, string> = {
    no_expert_in_sla: 'No professional available nearby right now. Please try again shortly.',
    service_not_found: 'This service is not available in your area.',
    missing_params: 'Please complete all required fields.',
    invalid_credentials: 'Incorrect password.',
    cloudinary_not_configured: 'Image uploads are not configured on the server yet.',
    wrong_role: 'You do not have access to this action.',
    invalid_token: 'Your session expired. Please sign in again.',
    missing_token: 'Please sign in to continue.',
  };
  if (err instanceof ApiError) return map[err.code] ?? err.code.replace(/_/g, ' ');
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}
