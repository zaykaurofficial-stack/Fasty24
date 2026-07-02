'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBookings, getUser, Booking, STATUS_LABELS, ACTIVE_STATUSES, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

function statusDot(status: string) {
  if (ACTIVE_STATUSES.includes(status as any)) return 'bg-fasty-yellow';
  if (status === 'completed') return 'bg-green-500';
  if (status === 'cancelled') return 'bg-red-500';
  return 'bg-gray-500';
}

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
    <main className="min-h-screen bg-fasty-black text-white">
      {/* Header */}
      <section className="relative pt-28 pb-10 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fasty-yellow/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/" className="text-gray-500 hover:text-fasty-yellow text-sm transition-colors mb-4 inline-flex items-center gap-1">
            ← Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">My Bookings</h1>
          <p className="text-gray-400 mt-2">Track live status of your home services</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl text-center py-20 px-6">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-fasty-yellow/10 border border-fasty-yellow/20 flex items-center justify-center text-3xl">
              📋
            </div>
            <h2 className="font-extrabold text-xl text-white mb-2">No bookings yet</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Your first service is just a tap away. AC, RO, cleaning & more — delivered in 15–20 minutes.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-fasty-yellow text-fasty-black font-bold px-7 py-3.5 rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,196,0,0.25)]"
            >
              Explore services →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const status = STATUS_LABELS[b.status] ?? { label: b.status, color: '' };
              const isActive = ACTIVE_STATUSES.includes(b.status);
              const title = b.items.map((it) => it.name).join(', ') || 'Service';
              const formattedDate = b.createdAt
                ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '';
              return (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className={`group block bg-[#141414] border rounded-2xl overflow-hidden hover:shadow-[0_8px_32px_-12px_rgba(255,196,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 ${
                    isActive ? 'border-fasty-yellow/30' : 'border-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="p-5">
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-fasty-yellow bg-fasty-yellow/8 border border-fasty-yellow/20 rounded-lg px-3 py-2">
                        <span className="relative w-2.5 h-2.5 rounded-full bg-fasty-yellow">
                          <span className="absolute inset-0 rounded-full bg-fasty-yellow animate-ping opacity-60" />
                        </span>
                        Live tracking active — tap to view
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base text-white truncate pr-2">{title}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="truncate">{b.location?.address || 'Address not set'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`w-2 h-2 rounded-full ${statusDot(b.status)}`} />
                        <span className="text-xs font-semibold text-gray-300">{status.label}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/6">
                      <div>
                        <span className="font-extrabold text-xl text-white">₹{b.pricing?.total ?? 0}</span>
                        {formattedDate && <span className="text-xs text-gray-600 ml-2">{formattedDate}</span>}
                      </div>
                      <span className="text-xs font-bold text-fasty-yellow group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View details
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
