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

const STEPS: { key: BookingStatus; label: string; icon: string }[] = [
  { key: 'searching', label: 'Finding a professional', icon: '🔍' },
  { key: 'assigned', label: 'Professional assigned', icon: '🧑‍🔧' },
  { key: 'in_progress', label: 'Service in progress', icon: '🛠️' },
  { key: 'completed', label: 'Completed', icon: '✅' },
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
      .catch((err) => {
        if (errorMessage(err)) setNotFound(true);
      });
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
    const onArrived = () => {
      toast('Your professional has arrived!', 'success');
      refresh();
    };
    const onLocation = (payload: { lat: number; lng: number }) => {
      setBooking((prev) =>
        prev && prev.expert
          ? { ...prev, expert: { ...prev.expert, lastLocation: { ...payload, updatedAt: new Date().toISOString() } } }
          : prev,
      );
    };
    const onFailed = () => {
      toast('No professional available nearby. Please try again.', 'error');
      refresh();
    };

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

  // Polling fallback so arrival/OTP/status updates show even without a live socket.
  useEffect(() => {
    const activeStates: BookingStatus[] = ['searching', 'assigned', 'in_progress'];
    if (!booking || !activeStates.includes(booking.status)) return;
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
    if (!booking || stars === 0) {
      toast('Please select a rating', 'error');
      return;
    }
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
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-40 mb-6" />
        <div className="skeleton h-48 w-full mb-4" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-extrabold mb-2">Booking not found</h1>
        <Link href="/bookings" className="btn-primary mt-4">
          Back to my bookings
        </Link>
      </div>
    );
  }

  const status = STATUS_LABELS[booking.status] ?? { label: booking.status, color: 'bg-gray-100' };
  const currentOrder = ORDER[booking.status];
  const isCancelled = booking.status === 'cancelled';
  const title = booking.items.map((it) => it.name).join(', ') || 'Service';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <Link href="/bookings" className="text-sm font-semibold text-fasty-gray hover:text-fasty-black">
        ← All bookings
      </Link>

      <div className="flex items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{title}</h1>
          <p className="text-sm text-fasty-gray mt-1">📍 {booking.location?.address}</p>
        </div>
        <span className={`chip ${status.color}`}>{status.label}</span>
      </div>

      {/* Tracking timeline */}
      {!isCancelled ? (
        <div className="card !p-6 mb-6">
          {booking.bookingType === 'scheduled' && booking.scheduledSlot && (
            <div className="mb-5 bg-blue-50 text-blue-800 rounded-xl px-4 py-3 text-sm font-semibold">
              📅 Scheduled for {booking.scheduledSlot.date} · {booking.scheduledSlot.window}:00
            </div>
          )}
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const stepOrder = ORDER[step.key];
              const done = currentOrder > stepOrder;
              const active = currentOrder === stepOrder;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                        done
                          ? 'bg-fasty-black text-fasty-yellow'
                          : active
                            ? 'bg-fasty-yellow text-fasty-black pulse-ring'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {done ? '✓' : step.icon}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 flex-1 min-h-[28px] ${done ? 'bg-fasty-black' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className={`pb-6 ${active ? '' : 'opacity-70'}`}>
                    <p className="font-bold">{step.label}</p>
                    {active && booking.status === 'searching' && (
                      <p className="text-xs text-fasty-gray mt-0.5">Matching you with the nearest verified pro...</p>
                    )}
                    {active && booking.status === 'assigned' && !booking.timeline?.arrivedAt && booking.quotedEtaMin != null && (
                      <p className="text-xs text-fasty-gray mt-0.5">
                        ETA ~{Math.round(booking.quotedEtaMin)} min
                        {booking.distanceKm != null && ` · ${booking.distanceKm} km away`}
                      </p>
                    )}
                    {active && booking.status === 'assigned' && booking.timeline?.arrivedAt && (
                      <p className="text-xs font-semibold text-green-700 mt-0.5">
                        Professional has arrived at your location
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card !p-6 mb-6 text-center text-fasty-gray">
          This booking was cancelled.
          {booking.cancelReason && <span className="block text-sm mt-1">Reason: {booking.cancelReason}</span>}
        </div>
      )}

      {/* Start OTP — customer reads this to the professional to begin the job */}
      {!isCancelled && booking.sessionOtp?.requiresStartOtp && booking.sessionOtp.startCode && (
        <div className="card !p-6 mb-6 border-2 border-fasty-yellow bg-fasty-yellow/10 text-center">
          {booking.timeline?.arrivedAt && (
            <p className="text-sm font-bold text-fasty-black mb-2">🚪 Your professional has arrived</p>
          )}
          <p className="text-sm text-fasty-gray">
            Share this OTP to <span className="font-bold text-fasty-black">start</span> the service
          </p>
          <p className="text-4xl font-extrabold tracking-[0.35em] my-3">{booking.sessionOtp.startCode}</p>
          <p className="text-xs text-fasty-gray">Only share when the professional is at your doorstep.</p>
        </div>
      )}

      {/* Completion OTP — customer reads this to the professional when work is done */}
      {!isCancelled && booking.sessionOtp?.requiresEndOtp && booking.sessionOtp.endCode && (
        <div className="card !p-6 mb-6 border-2 border-green-500 bg-green-50 text-center">
          <p className="text-sm text-fasty-gray">
            Share this OTP to <span className="font-bold text-green-700">complete</span> the service
          </p>
          <p className="text-4xl font-extrabold tracking-[0.35em] my-3">{booking.sessionOtp.endCode}</p>
          <p className="text-xs text-fasty-gray">Share only after the work is fully done.</p>
        </div>
      )}

      {/* Expert card */}
      {booking.expert && booking.expert.name && (
        <div className="card !p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-fasty-light flex items-center justify-center text-2xl shrink-0">
            {booking.expert.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={booking.expert.photoUrl} alt={booking.expert.name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              '🧑‍🔧'
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold">{booking.expert.name}</p>
            <p className="text-sm text-fasty-gray">★ {booking.expert.rating} · Verified professional</p>
          </div>
          {booking.expert.phone && (
            <a href={`tel:${booking.expert.phone}`} className="btn-outline !px-4 !py-2 text-sm">
              Call
            </a>
          )}
        </div>
      )}

      {/* Price summary */}
      <div className="card !p-5 mb-6">
        <h2 className="font-bold mb-3">Payment</h2>
        <div className="space-y-2 text-sm">
          {booking.items.map((it) => (
            <div key={it.id} className="flex justify-between">
              <span className="text-fasty-gray">
                {it.name} {it.isAddOn && <span className="text-xs">(add-on)</span>}
              </span>
              <span className="font-semibold">₹{it.price}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-fasty-gray">Taxes</span>
            <span className="font-semibold">₹{booking.pricing.tax}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-100">
            <span className="font-bold">Total</span>
            <span className="font-extrabold">₹{booking.pricing.total}</span>
          </div>
          <p className="text-xs text-fasty-gray pt-1">
            Status: <span className="font-semibold capitalize">{booking.payment.status}</span>
          </p>
        </div>
      </div>

      {/* Rating */}
      {booking.status === 'completed' && (
        <div className="card !p-5 mb-6">
          <h2 className="font-bold mb-3">Rate your experience</h2>
          {booking.rating?.stars ? (
            <p className="text-fasty-gray text-sm">
              You rated this service {booking.rating.stars}★
              {booking.rating.comment && ` - "${booking.rating.comment}"`}
            </p>
          ) : (
            <>
              <div className="flex gap-2 mb-4 text-3xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setStars(n)}
                    className={n <= stars ? 'text-fasty-yellow' : 'text-gray-300'}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us how it went (optional)"
                className="input-field mb-3 min-h-[80px]"
              />
              <button onClick={handleRate} disabled={working} className="btn-primary w-full">
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
          className="w-full text-center text-sm font-semibold text-red-600 hover:underline py-3"
        >
          Cancel booking
        </button>
      )}
    </div>
  );
}
