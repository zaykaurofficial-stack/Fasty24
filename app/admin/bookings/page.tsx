'use client';

import { useEffect, useState } from 'react';
import { adminGetBookings, Booking, STATUS_LABELS, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetBookings()
      .then(setBookings)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Bookings</h1>
      <p className="text-fasty-gray mb-6">All bookings across the platform</p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16 text-fasty-gray">No bookings yet.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-fasty-light text-fasty-gray text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Expert</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const status = STATUS_LABELS[b.status] ?? { label: b.status, color: 'bg-gray-100' };
                return (
                  <tr key={b.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 font-semibold">{b.items.map((i) => i.name).join(', ')}</td>
                    <td className="px-5 py-3 text-fasty-gray">{b.customer?.name || b.customer?.phone || '—'}</td>
                    <td className="px-5 py-3 text-fasty-gray">{b.expert?.name || '—'}</td>
                    <td className="px-5 py-3 capitalize text-fasty-gray">{b.bookingType}</td>
                    <td className="px-5 py-3">
                      <span className={`chip ${status.color}`}>{status.label}</span>
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
