'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBookings, getUser, Booking, STATUS_LABELS } from '@/lib/api';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) {
      router.push('/login');
      return;
    }
    getBookings().then(setBookings).finally(() => setLoading(false));
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
          <div className="card animate-pulse text-fasty-gray text-center py-12">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-16 shadow-xl">
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&q=80"
                alt="No bookings"
                fill
                className="object-cover opacity-80"
              />
            </div>
            <h2 className="font-extrabold text-xl mb-2">No bookings yet</h2>
            <p className="text-fasty-gray text-sm mb-8 max-w-sm mx-auto">
              Your first service is just a tap away. AC, RO, cleaning & more — delivered in 15–20 minutes.
            </p>
            <Link href="/categories" className="btn-primary inline-block">
              Explore services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => {
              const status = STATUS_LABELS[b.status] ?? { label: b.status, color: 'bg-gray-100 text-gray-800' };
              const isActive = ['dispatching', 'assigned', 'staff_en_route', 'in_progress'].includes(b.status);
              return (
                <div
                  key={b._id}
                  className={`card !p-0 overflow-hidden border-l-4 ${
                    isActive ? 'border-l-fasty-yellow shadow-lg' : 'border-l-gray-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <span className="text-xs font-bold text-fasty-gray uppercase tracking-wider">
                          Booking #{bookings.length - i}
                        </span>
                        <h3 className="font-extrabold text-xl mt-1">{b.serviceName}</h3>
                        {b.address && (
                          <p className="text-sm text-fasty-gray mt-1 flex items-center gap-1">
                            📍 {b.address.line1}, {b.address.city}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    {isActive && (
                      <div className="bg-fasty-light rounded-xl p-4 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-fasty-yellow rounded-full flex items-center justify-center animate-pulse">
                          ⚡
                        </div>
                        <div>
                          <p className="font-bold text-sm">Live tracking active</p>
                          <p className="text-xs text-fasty-gray">
                            {b.status === 'dispatching' && 'Finding nearest professional...'}
                            {b.status === 'assigned' && 'Staff assigned — on the way!'}
                            {b.status === 'staff_en_route' && 'Professional is en route to you'}
                            {b.status === 'in_progress' && 'Service in progress at your location'}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="font-extrabold text-2xl">₹{b.totalPrice}</span>
                      <span className="text-sm text-fasty-gray">Paid · Receipt available</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
