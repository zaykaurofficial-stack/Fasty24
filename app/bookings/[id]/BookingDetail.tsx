'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getBooking,
  getUser,
  cancelBooking,
  rateBooking,
  getInvoiceLink,
  createBookingPaymentOrder,
  verifyBookingPayment,
  getSlots,
  convertBookingToSchedule,
  getBookingEstimates,
  approveEstimate,
  rejectEstimate,
  acceptAddon,
  dismissAddon,
  createEstimatePaymentOrder,
  verifyEstimatePayment,
  Booking,
  BookingStatus,
  Estimate,
  AddonSuggestion,
  Slot,
  STATUS_LABELS,
  errorMessage,
} from '@/lib/api';
import { openRazorpayCheckout, CheckoutCancelledError } from '@/lib/razorpayCheckout';
import { getSocket, subscribeToBooking, unsubscribeFromBooking } from '@/lib/socket';
import { toast } from '@/lib/toast';
import ExpertTrackingMap from '@/components/ExpertTrackingMap';

const STEPS: { key: BookingStatus; label: string; icon: string; desc: string }[] = [
  { key: 'searching', label: 'Finding a professional', icon: '🔍', desc: 'Matching you with the nearest verified expert…' },
  { key: 'assigned', label: 'Professional assigned', icon: '🧑‍🔧', desc: 'Your expert accepted the job' },
  { key: 'travelling', label: 'Expert on the way', icon: '🚗', desc: 'Your expert is travelling to your location' },
  { key: 'arrived', label: 'Expert arrived', icon: '🚪', desc: 'Share the start OTP with your expert' },
  { key: 'in_progress', label: 'Service in progress', icon: '🛠️', desc: 'Work is underway — share the end OTP when done' },
  { key: 'completed', label: 'Completed', icon: '✅', desc: 'Service completed successfully' },
];

const ORDER: Record<BookingStatus, number> = {
  created: 0,
  scheduled: 1,
  searching: 1,
  high_demand: 1,
  needs_assignment: 1,
  assigned: 2,
  travelling: 3,
  arrived: 4,
  in_progress: 5,
  completed: 6,
  cancelled: -1,
};

const CANCELLABLE: BookingStatus[] = ['created', 'scheduled', 'searching', 'high_demand', 'needs_assignment', 'assigned'];

function nextDays(n: number) {
  const days: { value: string; label: string }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({
      value,
      label:
        i === 0
          ? 'Today'
          : i === 1
            ? 'Tomorrow'
            : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }
  return days;
}

function formatAssignWhen(iso?: string | null) {
  if (!iso) return '30 minutes before your slot';
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function BookingDetail({ id }: { id: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [working, setWorking] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [days] = useState(() => nextDays(7));
  const [slotDate, setSlotDate] = useState(days[0]?.value ?? '');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    return getBooking(id)
      .then(setBooking)
      .catch(() => setNotFound(true));
  }, [id]);

  const refreshEstimates = useCallback(() => {
    return getBookingEstimates(id)
      .then(setEstimates)
      .catch(() => setEstimates([]));
  }, [id]);

  useEffect(() => {
    if (!getUser()) {
      router.push(`/login?redirect=/bookings/${id}`);
      return;
    }
    Promise.all([refresh(), refreshEstimates()]).finally(() => setLoading(false));
  }, [id, refresh, refreshEstimates, router]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    subscribeToBooking(id);

    const onStatus = () => refresh();
    const onArrived = () => { toast('Your professional has arrived! Share the start OTP.', 'success'); refresh(); };
    const onEnRoute = () => { toast('Your professional is on the way 🚗', 'success'); refresh(); };
    const onLocation = (payload: {
      lat: number;
      lng: number;
      etaMin?: number;
      distanceKm?: number;
      route?: { lat: number; lng: number }[];
      routeChanged?: boolean;
    }) => {
      setBooking((prev) => {
        if (!prev) return prev;
        const nextRoute =
          payload.routeChanged && payload.route && payload.route.length >= 3
            ? payload.route
            : prev.route && prev.route.length >= 3
              ? prev.route
              : payload.route && payload.route.length >= 3
                ? payload.route
                : prev.route;
        return {
          ...prev,
          quotedEtaMin: payload.etaMin ?? prev.quotedEtaMin,
          distanceKm: payload.distanceKm ?? prev.distanceKm,
          route: nextRoute,
          expert: prev.expert
            ? {
                ...prev.expert,
                lastLocation: { lat: payload.lat, lng: payload.lng, updatedAt: new Date().toISOString() },
              }
            : prev.expert,
        };
      });
    };
    const onFailed = () => { refresh(); };
    const onEstimate = () => { toast('Your expert sent a repair estimate', 'success'); refreshEstimates(); };
    const onAddon = () => { toast('Your expert suggested an add-on', 'success'); refresh(); };

    socket.on('booking:status', onStatus);
    socket.on('booking:update', onStatus);
    socket.on('booking:assigned', onStatus);
    socket.on('booking:arrived', onArrived);
    socket.on('booking:en_route', onEnRoute);
    socket.on('booking:expert_location', onLocation);
    socket.on('booking:failed', onFailed);
    socket.on('estimate:new', onEstimate);
    socket.on('estimate:paid', onEstimate);
    socket.on('estimate:updated', onEstimate);
    socket.on('booking:addon_suggest', onAddon);
    socket.on('booking:addon', onAddon);

    return () => {
      socket.off('booking:status', onStatus);
      socket.off('booking:update', onStatus);
      socket.off('booking:assigned', onStatus);
      socket.off('booking:arrived', onArrived);
      socket.off('booking:en_route', onEnRoute);
      socket.off('booking:expert_location', onLocation);
      socket.off('booking:failed', onFailed);
      socket.off('estimate:new', onEstimate);
      socket.off('estimate:paid', onEstimate);
      socket.off('estimate:updated', onEstimate);
      socket.off('booking:addon_suggest', onAddon);
      socket.off('booking:addon', onAddon);
      unsubscribeFromBooking(id);
    };
  }, [id, refresh, refreshEstimates]);

  // Polling fallback for active bookings
  useEffect(() => {
    const active: BookingStatus[] = ['searching', 'high_demand', 'scheduled', 'assigned', 'travelling', 'arrived', 'in_progress'];
    if (!booking || !active.includes(booking.status)) return;
    const t = setInterval(() => {
      refresh();
      refreshEstimates();
    }, 5000);
    return () => clearInterval(t);
  }, [booking?.status, refresh, refreshEstimates]);

  useEffect(() => {
    if (booking?.status !== 'high_demand') return;
    const lat = booking.location?.lat;
    const lng = booking.location?.lng;
    const serviceId = booking.items?.[0]?.serviceId || booking.items?.[0]?.id;
    if (lat == null || lng == null || !serviceId) return;
    let cancelled = false;
    setSlotsLoading(true);
    getSlots({ serviceId: String(serviceId), date: slotDate, lat, lng })
      .then((res) => {
        if (cancelled) return;
        const list = res.slots || [];
        setSlots(list);
        setSlotId(list.find((s) => s.available)?.slotId || '');
      })
      .catch((err) => {
        if (!cancelled) {
          setSlots([]);
          toast(errorMessage(err), 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booking?.status, booking?.location?.lat, booking?.location?.lng, booking?.items, slotDate]);

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

  async function handleConvertToSchedule() {
    if (!booking || !slotId) {
      toast('Please choose a time slot', 'error');
      return;
    }
    setConverting(true);
    try {
      await convertBookingToSchedule(booking.id, slotId, slotDate);
      toast('Slot booked. A professional will be assigned 30 minutes before.', 'success');
      refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setConverting(false);
    }
  }

  async function handleDownloadInvoice() {
    if (!booking) return;
    setInvoiceLoading(true);
    try {
      const { url } = await getInvoiceLink(booking.id);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setInvoiceLoading(false);
    }
  }

  async function handlePayNow() {
    if (!booking) return;
    setWorking(true);
    try {
      const order = await createBookingPaymentOrder(booking.id);
      const result = await openRazorpayCheckout(order);
      await verifyBookingPayment(booking.id, result);
      toast('Payment successful!', 'success');
      refresh();
    } catch (err) {
      if (err instanceof CheckoutCancelledError) {
        toast('Payment cancelled', 'info');
      } else {
        toast(errorMessage(err), 'error');
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleApproveEstimate(estimate: Estimate) {
    setActingId(estimate.id);
    try {
      const updated = await approveEstimate(estimate.id);
      setEstimates((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast('Estimate approved', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  }

  async function handleRejectEstimate(estimate: Estimate) {
    setActingId(estimate.id);
    try {
      const updated = await rejectEstimate(estimate.id);
      setEstimates((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast('Estimate declined', 'info');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  }

  async function handlePayEstimate(estimate: Estimate) {
    setActingId(estimate.id);
    try {
      const order = await createEstimatePaymentOrder(estimate.id);
      const result = await openRazorpayCheckout(order);
      const updated = await verifyEstimatePayment(estimate.id, result);
      setEstimates((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast('Payment received', 'success');
    } catch (err) {
      if (err instanceof CheckoutCancelledError) {
        toast('Payment cancelled', 'info');
      } else {
        toast(errorMessage(err), 'error');
      }
    } finally {
      setActingId(null);
    }
  }

  async function handleAcceptAddon(suggestion: AddonSuggestion) {
    if (!booking) return;
    setActingId(suggestion.id);
    try {
      const updated = await acceptAddon(booking.id, suggestion.serviceSlug || suggestion.serviceId);
      setBooking(updated);
      toast(`${suggestion.name} added`, 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  }

  async function handleDismissAddon(suggestion: AddonSuggestion) {
    if (!booking) return;
    setActingId(suggestion.id);
    try {
      const updated = await dismissAddon(booking.id, suggestion.id);
      setBooking(updated);
      toast('Add-on declined', 'info');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setActingId(null);
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
  const canDownloadInvoice =
    booking.invoiceAvailable ?? (isCompleted && booking.payment.status === 'paid');
  const title = booking.items.map((it) => it.name).join(', ') || 'Service';
  const pendingAddons = (booking.pendingSuggestions || []).filter((s) => s.status === 'pending');
  const actionableEstimates = estimates.filter(
    (e) => e.status === 'sent' || (e.status === 'approved' && !e.settled),
  );
  const steps =
    booking.bookingType === 'scheduled'
      ? [
          {
            key: 'scheduled' as BookingStatus,
            label: 'Slot confirmed',
            icon: '📅',
            desc: 'A professional will be assigned 30 minutes before your slot',
          },
          ...STEPS.slice(1),
        ]
      : STEPS;

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
                {booking.scheduledSlot.date} · {booking.scheduledSlot.label || booking.scheduledSlot.window}
              </p>
              {!booking.expert ? (
                <p className="text-xs text-blue-200/90 mt-1">
                  A professional will be assigned 30 minutes before your slot
                  {booking.assignmentAt ? ` (around ${formatAssignWhen(booking.assignmentAt)})` : ''}.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {booking.status === 'high_demand' && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-4 space-y-4">
            <div>
              <p className="font-bold text-orange-300 text-sm">High demand in your area</p>
              <p className="text-xs text-orange-200/80 mt-1">
                No professional is free right now. Pick a slot — we&apos;ll assign an expert 30 minutes before.
              </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSlotDate(d.value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold ${
                    slotDate === d.value ? 'bg-fasty-yellow text-fasty-black' : 'bg-white/5 text-gray-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {slotsLoading ? (
              <p className="text-xs text-gray-500">Loading slots…</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.slotId}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSlotId(s.slotId)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                      slotId === s.slotId
                        ? 'border-fasty-yellow bg-fasty-yellow text-fasty-black'
                        : s.available
                          ? 'border-white/15 text-gray-200'
                          : 'border-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {s.label || s.window}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              disabled={converting || !slotId}
              onClick={handleConvertToSchedule}
              className="w-full bg-fasty-yellow text-fasty-black font-extrabold py-3 rounded-xl disabled:opacity-50"
            >
              {converting ? 'Booking slot…' : 'Schedule this booking'}
            </button>
          </div>
        )}

        {pendingAddons.map((suggestion) => (
          <div
            key={suggestion.id || suggestion.serviceSlug}
            className="bg-fasty-yellow/10 border border-fasty-yellow/40 rounded-2xl p-5 space-y-3"
          >
            <div>
              <p className="text-[11px] font-bold text-fasty-yellow uppercase tracking-widest">Add-on needs approval</p>
              <h2 className="text-lg font-extrabold text-white mt-1">{suggestion.name}</h2>
              {suggestion.message ? (
                <p className="text-sm text-gray-400 mt-1">{suggestion.message}</p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Your expert suggested this extra service.</p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-extrabold text-white">₹{suggestion.price}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={actingId === suggestion.id}
                  onClick={() => handleDismissAddon(suggestion)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  type="button"
                  disabled={actingId === suggestion.id}
                  onClick={() => handleAcceptAddon(suggestion)}
                  className="px-4 py-2 rounded-xl text-sm font-extrabold bg-fasty-yellow text-fasty-black disabled:opacity-50"
                >
                  {actingId === suggestion.id ? 'Saving…' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {actionableEstimates.map((estimate) => {
          const awaiting = estimate.status === 'sent';
          return (
            <div
              key={estimate.id}
              className="bg-fasty-yellow/10 border border-fasty-yellow/40 rounded-2xl p-5 space-y-4"
            >
              <div>
                <p className="text-[11px] font-bold text-fasty-yellow uppercase tracking-widest">
                  {awaiting ? 'Estimate needs approval' : 'Payment pending'}
                </p>
                <h2 className="text-lg font-extrabold text-white mt-1">
                  {estimate.estimateNo || 'Repair estimate'}
                </h2>
                {estimate.diagnosisNotes ? (
                  <p className="text-sm text-gray-400 mt-1">{estimate.diagnosisNotes}</p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">
                    {estimate.lines.length} item{estimate.lines.length === 1 ? '' : 's'} to replace
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {estimate.lines.map((line) => (
                  <div key={line.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {line.name} × {line.qty}
                    </span>
                    <span className="font-semibold text-white">₹{line.lineTotal}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base pt-2 border-t border-white/10">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-extrabold text-fasty-yellow">₹{estimate.pricing.total}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {awaiting ? (
                  <>
                    <button
                      type="button"
                      disabled={actingId === estimate.id}
                      onClick={() => handleRejectEstimate(estimate)}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-bold border border-white/15 text-gray-300 disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={actingId === estimate.id}
                      onClick={() => handleApproveEstimate(estimate)}
                      className="flex-[1.6] px-4 py-3 rounded-xl text-sm font-extrabold bg-fasty-yellow text-fasty-black disabled:opacity-50"
                    >
                      {actingId === estimate.id ? 'Saving…' : `Approve ₹${estimate.pricing.total}`}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={actingId === estimate.id}
                    onClick={() => handlePayEstimate(estimate)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-extrabold bg-fasty-yellow text-fasty-black disabled:opacity-50"
                  >
                    {actingId === estimate.id ? 'Opening checkout…' : `Pay ₹${estimate.pricing.total}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Tracking timeline */}
        {!isCancelled && (
          <div className="bg-[#141414] border border-white/8 rounded-2xl px-5 py-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Booking Progress</p>
            <div>
              {steps.map((step, i) => {
                const stepOrder = ORDER[step.key];
                const done = currentOrder > stepOrder;
                const active = currentOrder === stepOrder;
                const last = i === steps.length - 1;
                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center w-7 shrink-0">
                      <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        done ? 'bg-fasty-yellow text-fasty-black'
                        : active ? 'bg-fasty-yellow/20 border-2 border-fasty-yellow text-fasty-yellow'
                        : 'bg-white/5 border border-white/10 text-gray-600'
                      }`}>
                        {done ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="leading-none">{step.icon}</span>
                        )}
                      </div>
                      {!last && (
                        <div className={`w-0.5 flex-1 min-h-[10px] my-0.5 ${done ? 'bg-fasty-yellow/60' : 'bg-white/10'}`} />
                      )}
                    </div>
                    <div className={`${last ? 'pb-0' : active ? 'pb-2' : 'pb-1.5'} ${active ? '' : done ? '' : 'opacity-40'}`}>
                      <p className={`font-semibold text-sm leading-7 ${active ? 'text-white' : done ? 'text-gray-300' : 'text-gray-600'}`}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="text-xs text-gray-400 -mt-0.5 mb-1">
                          {booking.status === 'travelling' && booking.quotedEtaMin
                            ? `ETA ~${Math.round(booking.quotedEtaMin)} min${booking.distanceKm ? ` · ${booking.distanceKm} km away` : ''}`
                            : booking.status === 'arrived'
                            ? 'Share the start OTP below with your professional'
                            : booking.status === 'in_progress'
                            ? 'Share the completion OTP below when the work is done'
                            : booking.status === 'needs_assignment'
                            ? 'Our team is assigning a professional for your slot now'
                            : booking.status === 'high_demand'
                            ? 'High demand nearby — pick a slot below'
                            : booking.status === 'scheduled'
                            ? 'A professional will be assigned 30 minutes before your slot'
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

        {(booking.status === 'assigned' || booking.status === 'travelling') &&
          typeof booking.location?.lat === 'number' &&
          typeof booking.location?.lng === 'number' && (
            <ExpertTrackingMap
              customer={{ lat: booking.location.lat, lng: booking.location.lng }}
              expert={
                booking.expert?.lastLocation?.lat != null && booking.expert?.lastLocation?.lng != null
                  ? { lat: booking.expert.lastLocation.lat, lng: booking.expert.lastLocation.lng }
                  : null
              }
              etaMin={booking.quotedEtaMin}
              distanceKm={booking.distanceKm}
              expertName={booking.expert?.name}
              route={booking.route}
            />
          )}

        {isCancelled && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-bold mb-1">Booking Cancelled</p>
            {booking.cancelReason && (
              <p className="text-sm text-red-400/70">
                {booking.cancelReason === 'no_expert_nearby'
                  ? 'No expert is available within 7 km right now. Please try again shortly.'
                  : booking.cancelReason === 'no_expert_in_sla'
                    ? 'No expert accepted in time. Please try again shortly.'
                    : `Reason: ${booking.cancelReason}`}
              </p>
            )}
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
            {(booking.pricing.platformFee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Platform fee</span>
                <span className="font-semibold text-white">₹{booking.pricing.platformFee}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Govt. taxes</span>
              <span className="font-semibold text-white">
                ₹{(booking.pricing.tax ?? 0) + (booking.pricing.platformFeeTax ?? 0)}
              </span>
            </div>
            <div className="flex justify-between text-base pt-3 border-t border-white/8">
              <span className="font-bold text-white">Total</span>
              <span className="font-extrabold text-fasty-yellow">₹{booking.pricing.total}</span>
            </div>
            <p className="text-xs text-gray-600 pt-1">
              Payment: <span className="capitalize text-gray-400">{booking.payment.status}</span>
            </p>
            {booking.payment.status !== 'paid' && booking.status !== 'cancelled' && (
              <button
                onClick={handlePayNow}
                disabled={working}
                className="mt-3 w-full bg-fasty-yellow text-fasty-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
              >
                {working ? 'Opening checkout…' : `Pay ₹${booking.pricing.total}`}
              </button>
            )}
            {canDownloadInvoice && (
              <button
                onClick={handleDownloadInvoice}
                disabled={invoiceLoading}
                className="mt-3 w-full border border-white/15 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {invoiceLoading ? 'Preparing invoice…' : 'Download invoice'}
              </button>
            )}
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
