export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const theme = {
  yellow: '#FFC400',
  black: '#0D0D0D',
  white: '#FFFFFF',
  gray: '#6B7280',
  light: '#F9FAFB',
};

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  description?: string;
  services?: Service[];
}

export interface Service {
  _id: string;
  name: string;
  categoryId: string;
  estimatedDurationMinutes?: number;
  description?: string;
}

export interface Booking {
  _id: string;
  serviceName: string;
  status: string;
  totalPrice: number;
  address?: { line1: string; city: string };
  createdAt?: string;
}

export const MOCK_CATEGORIES: Category[] = [
  {
    _id: '1',
    name: 'AC Repair & Services',
    icon: '❄️',
    description: 'Gas filling, servicing & installation',
    services: [
      { _id: 's1', name: 'Gas Filling', categoryId: '1', estimatedDurationMinutes: 45 },
      { _id: 's2', name: 'General AC Service', categoryId: '1', estimatedDurationMinutes: 60 },
    ],
  },
  {
    _id: '2',
    name: 'RO Repair & Servicing',
    icon: '💧',
    description: 'Filter change, membrane replacement',
    services: [
      { _id: 's3', name: 'Filter Change', categoryId: '2', estimatedDurationMinutes: 30 },
    ],
  },
  {
    _id: '3',
    name: 'Instant Maid',
    icon: '🧹',
    description: 'Quick home cleaning in 15-20 mins',
    services: [
      { _id: 's4', name: '1 Hour Maid', categoryId: '3', estimatedDurationMinutes: 60 },
    ],
  },
  {
    _id: '4',
    name: 'Fridge Services',
    icon: '🧊',
    description: 'Cooling issues & gas refill',
    services: [
      { _id: 's5', name: 'Gas Refill', categoryId: '4', estimatedDurationMinutes: 45 },
    ],
  },
  {
    _id: '5',
    name: 'Bathroom Cleaning',
    icon: '🚿',
    description: 'Standard & deep clean',
    services: [
      { _id: 's6', name: 'Standard Clean', categoryId: '5', estimatedDurationMinutes: 60 },
    ],
  },
  {
    _id: '6',
    name: 'Chimney Cleaning',
    icon: '🏠',
    description: 'Basic & deep degreasing',
    services: [
      { _id: 's7', name: 'Basic Clean', categoryId: '6', estimatedDurationMinutes: 45 },
    ],
  },
];

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fasty_token');
}

export function setAuth(token: string, user: { phone: string; role: string }) {
  localStorage.setItem('fasty_token', token);
  localStorage.setItem('fasty_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('fasty_token');
  localStorage.removeItem('fasty_user');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('fasty_user');
  return raw ? JSON.parse(raw) : null;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

export async function sendOtp(phone: string) {
  return apiFetch<{ message: string }>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, code: string) {
  return apiFetch<{ accessToken: string; user: { phone: string; role: string } }>(
    '/auth/otp/verify',
    { method: 'POST', body: JSON.stringify({ phone, code }) },
  );
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await apiFetch<Category[]>('/catalog/categories');
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getBookings(): Promise<Booking[]> {
  try {
    return await apiFetch<Booking[]>('/bookings');
  } catch {
    const mock = localStorage.getItem('fasty_mock_bookings');
    return mock ? JSON.parse(mock) : [];
  }
}

export async function createBooking(data: {
  serviceId: string;
  serviceName: string;
  address: { line1: string; city: string; pincode: string; lat: number; lng: number };
}) {
  try {
    const result = await apiFetch<{ booking: Booking; paymentOrder: { orderId: string } }>(
      '/bookings',
      { method: 'POST', body: JSON.stringify({ serviceId: data.serviceId, address: data.address }) },
    );
    if (result.paymentOrder?.orderId) {
      await fetch(`${API_URL}/payments/dev/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: result.paymentOrder.orderId }),
      }).catch(() => null);
    }
    return result.booking;
  } catch {
    const booking: Booking = {
      _id: `mock-${Date.now()}`,
      serviceName: data.serviceName,
      status: 'dispatching',
      totalPrice: 499,
      address: { line1: data.address.line1, city: data.address.city },
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('fasty_mock_bookings') ?? '[]');
    existing.unshift(booking);
    localStorage.setItem('fasty_mock_bookings', JSON.stringify(existing));
    return booking;
  }
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  requested: { label: 'Requested', color: 'bg-gray-200 text-gray-800' },
  dispatching: { label: 'Finding Staff', color: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: 'Staff Assigned', color: 'bg-yellow-200 text-yellow-900' },
  staff_en_route: { label: 'On the Way', color: 'bg-yellow-300 text-black' },
  in_progress: { label: 'In Progress', color: 'bg-black text-yellow-400' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};
