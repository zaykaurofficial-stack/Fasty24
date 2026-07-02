'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBookings, getUser, Booking, STATUS_LABELS, ACTIVE_STATUSES, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) {
      router.push('/login?redirect=/bookings');
      return;
    }
    getBookings()
      .then(setBookings)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <section className="bg-fasty-black text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">My Bookings</h1>
          <p className="text-gray-400">Track live status of your home services</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 -mt-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-fasty-light flex items-center justify-center text-4xl">
              📋
            </div>
            <h2 className="font-extrabold text-xl mb-2">No bookings yet</h2>
            <p className="text-fasty-gray text-sm mb-8 max-w-sm mx-auto">
              Your first service is just a tap away. AC, RO, cleaning & more - delivered in 15-20 minutes.
            </p>
            <Link href="/categories" className="btn-primary">
              Explore services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const status = STATUS_LABELS[b.status] ?? { label: b.status, color: 'bg-gray-100 text-gray-800' };
              const isActive = ACTIVE_STATUSES.includes(b.status);
              const title = b.items.map((it) => it.name).join(', ') || 'Service';
              return (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className={`block card !p-0 overflow-hidden border-l-4 ${
                    isActive ? 'border-l-fasty-yellow' : 'border-l-gray-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h3 className="font-extrabold text-lg">{title}</h3>
                        <p className="text-sm text-fasty-gray mt-1">📍 {b.location?.address}</p>
                      </div>
                      <span className={`chip shrink-0 ${status.color}`}>{status.label}</span>
                    </div>
                    {isActive && (
                      <div className="bg-fasty-light rounded-xl p-3 mb-3 flex items-center gap-3">
                        <span className="relative w-3 h-3 rounded-full bg-fasty-yellow pulse-ring" />
                        <p className="text-xs text-fasty-gray font-semibold">Live tracking active - tap to view</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="font-extrabold text-xl">₹{b.pricing?.total ?? 0}</span>
                      <span className="text-sm text-fasty-yellow font-bold">View details →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
