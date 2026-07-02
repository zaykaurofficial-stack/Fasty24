'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getBooking,
  getUser,
  cancelBooking,
  rateBooking,
  Booking,
  BookingStatus,
  STATUS_LABELS,
  errorMessage,
} from '@/lib/api';
import { getSocket, subscribeToBooking, unsubscribeFromBooking } from '@/lib/socket';
import { toast } from '@/lib/toast';

const STEPS: { key: BookingStatus; label: string; icon: string; desc: string }[] = [
  { key: 'searching', label: 'Finding a professional', icon: '🔍', desc: 'Matching you with the nearest verified expert…' },
  { key: 'assigned', label: 'Professional assigned', icon: '🧑‍🔧', desc: 'Your expert is on their way' },
  { key: 'in_progress', label: 'Service in progress', icon: '🛠️', desc: 'Work is underway at your location' },
  { key: 'completed', label: 'Completed', icon: '✅', desc: 'Service completed successfully' },
];

const ORDER: Record<BookingStatus, number> = {
  created: 0,
  scheduled: 0,
  searching: 1,
  assigned: 2,
  in_progress: 3,
  completed: 4,
  cancelled: -1,
};

const CANCELLABLE: BookingStatus[] = ['created', 'scheduled', 'searching', 'assigned'];

export default function BookingDetail({ id }: { id: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [working, setWorking] = useState(false);

  const refresh = useCallback(() => {
    return getBooking(id)
      .then(setBooking)
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (!getUser()) {
      router.push(`/login?redirect=/bookings/${id}`);
      return;
    }
    refresh().finally(() => setLoading(false));
  }, [id, refresh, router]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    subscribeToBooking(id);

    const onStatus = () => refresh();
    const onArrived = () => { toast('Your professional has arrived! 🚪', 'success'); refresh(); };
    const onLocation = (payload: { lat: number; lng: number }) => {
      setBooking((prev) =>
        prev?.expert ? { ...prev, expert: { ...prev.expert, lastLocation: { ...payload, updatedAt: new Date().toISOString() } } } : prev,
      );
    };
    const onFailed = () => { toast('No professional available nearby. Please try again.', 'error'); refresh(); };

    socket.on('booking:status', onStatus);
    socket.on('booking:arrived', onArrived);
    socket.on('booking:expert_location', onLocation);
    socket.on('booking:failed', onFailed);

    return () => {
      socket.off('booking:status', onStatus);
      socket.off('booking:arrived', onArrived);
      socket.off('booking:expert_location', onLocation);
      socket.off('booking:failed', onFailed);
      unsubscribeFromBooking(id);
    };
  }, [id, refresh]);

  // Polling fallback for active bookings
  useEffect(() => {
    const active: BookingStatus[] = ['searching', 'assigned', 'in_progress'];
    if (!booking || !active.includes(booking.status)) return;
    const t = setInterval(() => refresh(), 5000);
    return () => clearInterval(t);
  }, [booking?.status, refresh]);

  async function handleCancel() {
    if (!booking) return;
    setWorking(true);
    try {
      await cancelBooking(booking.id);
      toast('Booking cancelled', 'info');
      refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setWorking(false);
    }
  }

  async function handleRate() {
    if (!booking || stars === 0) { toast('Please select a rating', 'error'); return; }
    setWorking(true);
    try {
      await rateBooking(booking.id, stars, comment);
      toast('Thanks for your feedback!', 'success');
      refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-fasty-black pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="h-8 w-40 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </main>
    );
  }

  if (notFound || !booking) {
    return (
      <main className="min-h-screen bg-fasty-black flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-extrabold text-white mb-2">Booking not found</h1>
        <Link href="/bookings" className="mt-4 bg-fasty-yellow text-fasty-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all">
          Back to bookings
        </Link>
      </main>
    );
  }

  const status = STATUS_LABELS[booking.status] ?? { label: booking.status, color: '' };
  const currentOrder = ORDER[booking.status];
  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';
  const title = booking.items.map((it) => it.name).join(', ') || 'Service';

  return (
    <main className="min-h-screen bg-fasty-black text-white">
      <section className="relative pt-28 pb-8 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-fasty-yellow/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/bookings" className="text-gray-500 hover:text-fasty-yellow text-sm transition-colors mb-4 inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All bookings
          </Link>
          <div className="flex items-start justify-between gap-4 mt-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">{title}</h1>
              <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {booking.location?.address}
              </p>
            </div>
            <div className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold ${
              isCancelled ? 'bg-red-500/20 text-red-400 border border-red-500/20'
              : isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/20'
              : 'bg-fasty-yellow/20 text-fasty-yellow border border-fasty-yellow/20'
            }`}>
              {!isCancelled && !isCompleted && (
                <span className="relative w-2 h-2 rounded-full bg-fasty-yellow">
                  <span className="absolute inset-0 rounded-full bg-fasty-yellow animate-ping opacity-60" />
                </span>
              )}
              {status.label}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5 animate-fade-in">

        {/* Scheduled slot banner */}
        {booking.bookingType === 'scheduled' && booking.scheduledSlot && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-bold text-blue-300 text-sm">Scheduled Booking</p>
              <p className="text-xs text-blue-400/80 mt-0.5">
                {booking.scheduledSlot.date} · {booking.scheduledSlot.window}
              </p>
            </div>
          </div>
        )}

        {/* Tracking timeline */}
        {!isCancelled && (
          <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Booking Progress</p>
            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const stepOrder = ORDER[step.key];
                const done = currentOrder > stepOrder;
                const active = currentOrder === stepOrder;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        done ? 'bg-fasty-yellow text-fasty-black'
                        : active ? 'bg-fasty-yellow/20 border-2 border-fasty-yellow text-fasty-yellow'
                        : 'bg-white/5 border border-white/10 text-gray-600'
                      }`}>
                        {done ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : step.icon}
                        {active && <span className="absolute -inset-1 rounded-full border-2 border-fasty-yellow/30 animate-ping" />}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[2rem] mt-1 ${done ? 'bg-fasty-yellow/60' : 'bg-white/8'}`} />
                      )}
                    </div>
                    <div className={`pb-6 ${active ? '' : done ? '' : 'opacity-40'}`}>
                      <p className={`font-bold text-sm ${active ? 'text-white' : done ? 'text-gray-300' : 'text-gray-600'}`}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {booking.status === 'assigned' && booking.quotedEtaMin
                            ? `ETA ~${Math.round(booking.quotedEtaMin)} min${booking.distanceKm ? ` · ${booking.distanceKm} km away` : ''}`
                            : booking.status === 'assigned' && booking.timeline?.arrivedAt
                            ? '✅ Professional has arrived at your location'
                            : step.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-bold mb-1">Booking Cancelled</p>
            {booking.cancelReason && <p className="text-sm text-red-400/70">Reason: {booking.cancelReason}</p>}
          </div>
        )}

        {/* Start OTP */}
        {!isCancelled && booking.sessionOtp?.requiresStartOtp && booking.sessionOtp.startCode && !booking.sessionOtp.startVerified && (
          <div className="bg-fasty-yellow/8 border-2 border-fasty-yellow/40 rounded-2xl p-6 text-center">
            {booking.timeline?.arrivedAt && (
              <p className="text-sm font-bold text-fasty-yellow mb-2">🚪 Your professional has arrived</p>
            )}
            <p className="text-sm text-gray-400">Share this OTP to <span className="font-bold text-white">start</span> the service</p>
            <p className="text-5xl font-extrabold tracking-[0.4em] my-4 text-white">{booking.sessionOtp.startCode}</p>
            <p className="text-xs text-gray-500">Only share when the professional is at your doorstep.</p>
          </div>
        )}

        {/* Completion OTP */}
        {!isCancelled && booking.sessionOtp?.requiresEndOtp && booking.sessionOtp.endCode && !booking.sessionOtp.endVerified && (
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400">Share this OTP to <span className="font-bold text-green-400">complete</span> the service</p>
            <p className="text-5xl font-extrabold tracking-[0.4em] my-4 text-green-400">{booking.sessionOtp.endCode}</p>
            <p className="text-xs text-gray-500">Share only after the work is fully done.</p>
          </div>
        )}

        {/* Expert card */}
        {booking.expert?.name && (
          <div className="bg-[#141414] border border-white/8 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {booking.expert.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={booking.expert.photoUrl} alt={booking.expert.name} className="w-full h-full object-cover" />
              ) : '🧑‍🔧'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{booking.expert.name}</p>
              <p className="text-sm text-gray-400">★ {booking.expert.rating?.toFixed(1)} · Verified professional</p>
            </div>
            {booking.expert.phone && (
              <a
                href={`tel:${booking.expert.phone}`}
                className="bg-fasty-yellow/10 border border-fasty-yellow/30 text-fasty-yellow font-bold px-4 py-2 rounded-xl text-sm hover:bg-fasty-yellow hover:text-fasty-black transition-all"
              >
                Call
              </a>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-fasty-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment
          </h2>
          <div className="space-y-2.5 text-sm">
            {booking.items.map((it) => (
              <div key={it.id} className="flex justify-between">
                <span className="text-gray-400">{it.name} {it.isAddOn && <span className="text-xs">(add-on)</span>}</span>
                <span className="font-semibold text-white">₹{it.price}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-gray-400">Taxes</span>
              <span className="font-semibold text-white">₹{booking.pricing.tax}</span>
            </div>
            <div className="flex justify-between text-base pt-3 border-t border-white/8">
              <span className="font-bold text-white">Total</span>
              <span className="font-extrabold text-fasty-yellow">₹{booking.pricing.total}</span>
            </div>
            <p className="text-xs text-gray-600 pt-1">
              Payment: <span className="capitalize text-gray-400">{booking.payment.status}</span>
            </p>
          </div>
        </div>

        {/* Rating */}
        {isCompleted && (
          <div className="bg-[#141414] border border-white/8 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-4">Rate your experience</h2>
            {booking.rating?.stars ? (
              <div>
                <div className="flex gap-1 text-fasty-yellow text-2xl mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} className={n <= booking.rating!.stars! ? 'text-fasty-yellow' : 'text-gray-700'}>★</span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">
                  You rated {booking.rating.stars}★
                  {booking.rating.comment && ` — "${booking.rating.comment}"`}
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4 text-3xl">
                  {[1,2,3,4,5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setStars(n)}
                      className={`transition-transform hover:scale-125 ${n <= stars ? 'text-fasty-yellow' : 'text-gray-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us how it went (optional)"
                  className="w-full bg-fasty-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-fasty-yellow/40 transition-colors resize-none min-h-[80px] mb-3"
                />
                <button
                  onClick={handleRate}
                  disabled={working || stars === 0}
                  className="w-full bg-fasty-yellow text-fasty-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit rating
                </button>
              </>
            )}
          </div>
        )}

        {/* Cancel */}
        {CANCELLABLE.includes(booking.status) && (
          <button
            onClick={handleCancel}
            disabled={working}
            className="w-full text-center text-sm font-semibold text-red-400 hover:text-red-300 py-3 rounded-xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-all disabled:opacity-50"
          >
            Cancel booking
          </button>
        )}
      </div>
    </main>
  );
}
