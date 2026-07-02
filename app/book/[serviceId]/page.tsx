'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getService,
  getSlots,
  getMe,
  getUser,
  createBooking,
  Service,
  Slot,
  Address,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';

const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.209;

function getNextDays(n: number) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: d.toISOString().split('T')[0],
    });
  }
  return days;
}

function BookFlow() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);

  // Scheduling
  const [bookingType, setBookingType] = useState<'instant' | 'scheduled'>('instant');
  const [selectedDate, setSelectedDate] = useState(getNextDays(1)[0].value);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Address
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddr, setUseNewAddr] = useState(false);
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('Delhi');
  const [newPincode, setNewPincode] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const days = getNextDays(5);

  // Auth guard + fetch service + addresses
  useEffect(() => {
    if (!getUser()) {
      router.push(`/login?redirect=/book/${serviceId}`);
      return;
    }
    Promise.all([
      getService(serviceId).catch(() => null),
      getMe().catch(() => null),
    ]).then(([svc, meRes]) => {
      if (svc) setService(svc);
      else { toast('Service not found', 'error'); router.push('/categories'); }

      if (meRes) {
        const addrs = meRes.principal.addresses ?? [];
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) { setSelectedAddressId(def.id); setUseNewAddr(false); }
        else if (addrs.length) { setSelectedAddressId(addrs[0].id); setUseNewAddr(false); }
        else setUseNewAddr(true);
      }
    }).finally(() => setLoadingService(false));
  }, [serviceId, router]);

  // Fetch slots when switching to scheduled or changing date
  useEffect(() => {
    if (bookingType !== 'scheduled' || !service || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
    const lat = addr?.lat ?? DEFAULT_LAT;
    const lng = addr?.lng ?? DEFAULT_LNG;
    getSlots({ serviceId: service.id, date: selectedDate, lat, lng })
      .then((res) => setSlots(res.slots.filter((s) => s.available)))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [bookingType, selectedDate, service, selectedAddressId, savedAddresses]);

  async function handleBook() {
    if (!service) return;
    if (bookingType === 'scheduled' && !selectedSlot) {
      toast('Please select a time slot', 'error');
      return;
    }
    const addr = buildAddress();
    if (!addr) { toast('Please provide a delivery address', 'error'); return; }

    setSubmitting(true);
    try {
      const booking = await createBooking({
        serviceIds: [service.id],
        location: addr,
        bookingType,
        slotId: selectedSlot?.slotId,
        date: bookingType === 'scheduled' ? selectedDate : undefined,
      });
      toast('Booking confirmed! 🎉', 'success');
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function buildAddress(): { address: string; lat: number; lng: number } | null {
    if (useNewAddr) {
      if (!newLine1.trim()) return null;
      return { address: `${newLine1}, ${newCity} ${newPincode}`.trim(), lat: DEFAULT_LAT, lng: DEFAULT_LNG };
    }
    const a = savedAddresses.find((x) => x.id === selectedAddressId);
    if (!a) return null;
    return {
      address: [a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(', '),
      lat: a.lat ?? DEFAULT_LAT,
      lng: a.lng ?? DEFAULT_LNG,
    };
  }

  const totalPrice = service ? Math.round(service.price * 1.18) : 0;
  const tax = service ? totalPrice - service.price : 0;

  if (loadingService) {
    return (
      <div className="min-h-screen bg-fasty-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-fasty-yellow/20 border-t-fasty-yellow rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading service details…</p>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <main className="min-h-screen bg-fasty-black pt-24 pb-32 relative overflow-hidden">
      <div className="absolute top-20 left-0 w-80 h-80 bg-fasty-yellow/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Back + Progress */}
        <div className="mb-8">
          <button
            onClick={() => step === 1 ? router.back() : setStep((prev) => (prev - 1) as 1 | 2 | 3)}
            className="text-gray-400 hover:text-fasty-yellow transition-colors mb-5 flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {step === 1 ? 'Back to service' : 'Previous step'}
          </button>

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Complete your booking</h1>
            <span className="text-fasty-yellow text-xs font-bold bg-fasty-yellow/10 border border-fasty-yellow/20 px-3 py-1.5 rounded-full">
              Step {step} of 3
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-fasty-yellow transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/4 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-up">

          {/* ─── STEP 1: Service Summary ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex gap-5 bg-fasty-black/50 p-4 rounded-2xl border border-white/5">
                {service.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <span className="text-3xl opacity-40">🛠️</span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-fasty-yellow uppercase tracking-widest mb-1">
                    {service.categories?.[0] || 'Service'}
                  </p>
                  <h2 className="text-xl font-bold text-white mb-2">{service.name}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                    {service.shortDescription || service.description || 'Professional service by verified experts.'}
                  </p>
                </div>
              </div>

              {service.inclusions.length > 0 && (
                <div className="bg-fasty-black/30 rounded-2xl p-4 border border-white/5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What&apos;s included</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-fasty-yellow text-xs">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/8">
                <div>
                  <p className="text-gray-500 text-sm">Service total</p>
                  <p className="text-4xl font-extrabold text-white">₹{service.price}</p>
                  <p className="text-xs text-gray-500 mt-0.5">+18% GST = ₹{totalPrice}</p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="bg-fasty-yellow text-fasty-black font-extrabold px-7 py-3.5 rounded-xl hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-[0_4px_20px_rgba(255,196,0,0.3)]"
                >
                  Select Time →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Schedule ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Booking type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['instant', 'scheduled'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setBookingType(type)}
                      className={`px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                        bookingType === type
                          ? 'bg-fasty-yellow text-fasty-black shadow-[0_0_15px_rgba(255,196,0,0.3)]'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:border-fasty-yellow/40'
                      }`}
                    >
                      {type === 'instant' ? '⚡ Instant (15-20 min)' : '📅 Schedule ahead'}
                    </button>
                  ))}
                </div>
              </div>

              {bookingType === 'scheduled' && (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Choose date</h3>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {days.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setSelectedDate(d.value)}
                          className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                            selectedDate === d.value
                              ? 'bg-fasty-yellow text-fasty-black'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-fasty-yellow/40 hover:text-white'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Available slots</h3>
                    {loadingSlots ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="bg-white/3 border border-white/8 rounded-xl p-6 text-center text-gray-500 text-sm">
                        No slots available for this date. Try a different date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {slots.map((slot) => (
                          <button
                            key={slot.slotId}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all text-center ${
                              selectedSlot?.slotId === slot.slotId
                                ? 'bg-fasty-yellow text-fasty-black shadow-[0_0_12px_rgba(255,196,0,0.3)]'
                                : 'bg-white/5 border border-white/10 text-gray-300 hover:border-fasty-yellow/40'
                            }`}
                          >
                            {slot.window}
                            <span className="block text-xs opacity-70 mt-0.5">{slot.remaining} left</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {bookingType === 'instant' && (
                <div className="bg-fasty-yellow/10 border border-fasty-yellow/20 rounded-2xl p-5 flex items-start gap-4">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-white mb-1">Instant Booking</p>
                    <p className="text-sm text-gray-400">A verified professional will be dispatched within 15–20 minutes of booking confirmation.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-white/8">
                <button
                  onClick={() => setStep(3)}
                  disabled={bookingType === 'scheduled' && !selectedSlot}
                  className="bg-fasty-yellow text-fasty-black font-extrabold px-7 py-3.5 rounded-xl hover:bg-yellow-400 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Enter Address →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Address + Confirm ─── */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white">Where should we arrive?</h3>

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAddressId(a.id); setUseNewAddr(false); }}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        !useNewAddr && selectedAddressId === a.id
                          ? 'border-fasty-yellow bg-fasty-yellow/8'
                          : 'border-white/10 bg-white/3 hover:border-fasty-yellow/40'
                      }`}
                    >
                      <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        !useNewAddr && selectedAddressId === a.id ? 'border-fasty-yellow' : 'border-white/30'
                      }`}>
                        {!useNewAddr && selectedAddressId === a.id && (
                          <span className="w-2 h-2 rounded-full bg-fasty-yellow block" />
                        )}
                      </span>
                      <div>
                        <p className="font-semibold text-white text-sm">{a.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      {a.isDefault && (
                        <span className="ml-auto text-[10px] font-bold text-fasty-yellow bg-fasty-yellow/10 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => { setUseNewAddr(true); setSelectedAddressId(null); }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                      useNewAddr ? 'border-fasty-yellow bg-fasty-yellow/8' : 'border-white/10 bg-white/3 hover:border-fasty-yellow/40'
                    }`}
                  >
                    <span className="text-sm text-fasty-yellow font-bold">+ Enter a new address</span>
                  </button>
                </div>
              )}

              {(useNewAddr || savedAddresses.length === 0) && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={newLine1}
                      onChange={(e) => setNewLine1(e.target.value)}
                      placeholder="House no., street, landmark"
                      className="w-full px-4 py-3.5 bg-fasty-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fasty-yellow/60 transition-all placeholder:text-gray-600 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">City</label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-4 py-3.5 bg-fasty-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fasty-yellow/60 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">Pincode</label>
                      <input
                        type="text"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="110001"
                        className="w-full px-4 py-3.5 bg-fasty-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fasty-yellow/60 transition-all placeholder:text-gray-600 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-fasty-black/50 rounded-2xl p-5 border border-white/8 space-y-2">
                <h4 className="font-bold text-white text-sm mb-3">Order Summary</h4>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{service.name}</span><span>₹{service.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>GST (18%)</span><span>₹{tax}</span>
                </div>
                {bookingType === 'scheduled' && selectedSlot && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Slot</span><span>{selectedSlot.window}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-fasty-yellow">₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={submitting}
                className="w-full bg-fasty-yellow text-fasty-black font-extrabold text-lg py-4 rounded-xl hover:bg-yellow-400 hover:scale-[1.01] transition-all duration-300 shadow-[0_4px_24px_rgba(255,196,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-fasty-black/30 border-t-fasty-black rounded-full animate-spin" />
                    Confirming booking…
                  </span>
                ) : `Confirm & Pay ₹${totalPrice}`}
              </button>

              <p className="text-center text-xs text-gray-600 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secured & encrypted checkout · Free cancellation before assignment
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-fasty-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-fasty-yellow/20 border-t-fasty-yellow rounded-full animate-spin" />
      </div>
    }>
      <BookFlow />
    </Suspense>
  );
}
