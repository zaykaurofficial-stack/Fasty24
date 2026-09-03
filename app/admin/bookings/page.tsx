'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { adminGetBookings, Booking, STATUS_LABELS, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'needs_action', label: 'Needs assignment' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'searching', label: 'Searching' },
  { value: 'high_demand', label: 'High demand' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function slotLabel(b: Booking) {
  if (b.bookingType !== 'scheduled') return 'Instant';
  const slot = b.scheduledSlot;
  if (!slot) return 'Scheduled';
  const time = slot.label || slot.window || '';
  return [slot.date, time].filter(Boolean).join(' · ');
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [bookingType, setBookingType] = useState('');

  useEffect(() => {
    setLoading(true);
    adminGetBookings({
      status: status || undefined,
      bookingType: bookingType || undefined,
    })
      .then(setBookings)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [status, bookingType]);

  const needsCount = useMemo(
    () => bookings.filter((b) => ['needs_assignment', 'searching', 'high_demand'].includes(b.status)).length,
    [bookings],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1">Jobs</h1>
          <p className="text-fasty-gray">
            Scheduled and live jobs. Assign an expert when no one accepts.
            {status === 'needs_action' && !loading ? ` ${needsCount} waiting.` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBookingType((v) => (v === 'scheduled' ? '' : 'scheduled'))}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              bookingType === 'scheduled'
                ? 'bg-fasty-black text-fasty-yellow border-fasty-black'
                : 'bg-white text-fasty-gray border-gray-200'
            }`}
          >
            Scheduled
          </button>
          <button
            type="button"
            onClick={() => setBookingType((v) => (v === 'instant' ? '' : 'instant'))}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              bookingType === 'instant'
                ? 'bg-fasty-black text-fasty-yellow border-fasty-black'
                : 'bg-white text-fasty-gray border-gray-200'
            }`}
          >
            Instant
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              status === f.value
                ? 'bg-fasty-black text-fasty-yellow border-fasty-black'
                : 'bg-white text-fasty-gray border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16 text-fasty-gray">No jobs match this filter.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-fasty-light text-fasty-gray text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Slot</th>
                <th className="px-5 py-3 font-semibold">Expert</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const statusMeta = STATUS_LABELS[b.status] ?? { label: b.status, color: 'bg-gray-100' };
                return (
                  <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50/80">
                    <td className="px-5 py-3 font-semibold">
                      <Link href={`/admin/bookings/${b.id}`} className="hover:underline">
                        {b.items.map((i) => i.name).join(', ')}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-fasty-gray">{b.customer?.name || b.customer?.phone || '—'}</td>
                    <td className="px-5 py-3 text-fasty-gray">{slotLabel(b)}</td>
                    <td className="px-5 py-3 text-fasty-gray">{b.expert?.name || 'Unassigned'}</td>
                    <td className="px-5 py-3">
                      <span className={`chip ${statusMeta.color}`}>{statusMeta.label}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold">₹{b.pricing?.total ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
