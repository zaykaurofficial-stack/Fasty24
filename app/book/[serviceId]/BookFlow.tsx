'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getService,
  getMe,
  getSlots,
  addAddress,
  createBooking,
  confirmPayment,
  Service,
  Address,
  Slot,
  errorMessage,
} from '@/lib/api';
import ServiceImage from '@/components/ServiceImage';
import { toast } from '@/lib/toast';

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209 };

function nextDays(count: number) {
  const days: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    days.push({ value, label });
  }
  return days;
}

export default function BookFlow({ slug }: { slug: string }) {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [bookingType, setBookingType] = useState<'instant' | 'scheduled'>('instant');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newAddr, setNewAddr] = useState({ line1: '', city: 'Delhi', pincode: '' });

  const days = useMemo(() => nextDays(7), []);
  const [date, setDate] = useState(days[0].value);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        // permission denied / unavailable → fall back to default location
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([getService(slug), getMe().catch(() => null)])
      .then(([svc, me]) => {
        if (!mounted) return;
        setService(svc);
        setBookingType(svc.serviceKind === 'timed' ? 'instant' : 'instant');
        if (!me) {
          router.push(`/login?redirect=/book/${slug}`);
          return;
        }
        setAuthChecked(true);
        const addrs = me.principal.addresses ?? [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (def) setSelectedAddressId(def.id);
        else setAddingNew(true);
      })
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug, router]);

  const activeAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  // Prefer the saved address coords, then the auto-detected browser location, then Delhi.
  const coords = geo ?? DEFAULT_LOCATION;
  const location =
    activeAddress && activeAddress.lat && activeAddress.lng
      ? { lat: activeAddress.lat, lng: activeAddress.lng }
      : coords;

  useEffect(() => {
    if (bookingType !== 'scheduled' || !service) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    getSlots({ serviceId: service.slug, date, lat: location.lat, lng: location.lng })
      .then((res) => setSlots(res.slots))
      .catch((err) => {
        setSlots([]);
        toast(errorMessage(err), 'error');
      })
      .finally(() => setSlotsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingType, date, service, selectedAddressId]);

  async function ensureAddress(): Promise<{ address: string; lat: number; lng: number } | null> {
    if (selectedAddressId && activeAddress) {
      const text = [activeAddress.line1, activeAddress.line2, activeAddress.city, activeAddress.pincode]
        .filter(Boolean)
        .join(', ');
      return { address: text, lat: location.lat, lng: location.lng };
    }
    if (!newAddr.line1.trim()) {
      toast('Please enter your address', 'error');
      return null;
    }
    await addAddress({ ...newAddr, lat: coords.lat, lng: coords.lng, label: 'Home' });
    const text = [newAddr.line1, newAddr.city, newAddr.pincode].filter(Boolean).join(', ');
    return { address: text, lat: coords.lat, lng: coords.lng };
  }

  async function handleConfirm() {
    if (!service) return;
    if (bookingType === 'scheduled' && !selectedSlot) {
      toast('Please choose a time slot', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const loc = await ensureAddress();
      if (!loc) {
        setSubmitting(false);
        return;
      }
      const booking = await createBooking({
        serviceIds: [service.slug],
        location: loc,
        bookingType,
        ...(bookingType === 'scheduled' ? { slotId: selectedSlot!, date } : {}),
      });
      await confirmPayment(booking.id);
      toast('Booking confirmed!', 'success');
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      toast(errorMessage(err), 'error');
      setSubmitting(false);
    }
  }

  if (loading || !authChecked) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 skeleton h-72" />
          <div className="lg:col-span-3 skeleton h-96" />
        </div>
      </div>
    );
  }

  if (!service) return null;

  const tax = Math.round(service.price * 0.05);
  const total = service.price + tax;
  const supportsScheduling = service.serviceKind !== 'timed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href={`/services/${service.slug}`} className="text-sm font-semibold text-fasty-gray hover:text-fasty-black">
        ← Back to service
      </Link>

      <div className="grid lg:grid-cols-5 gap-8 mt-6">
        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="relative h-56 rounded-2xl overflow-hidden mb-4">
            <ServiceImage
              src={service.imageUrl}
              alt={service.name}
              accentSlug={service.categories?.[0]}
              rounded="rounded-2xl"
              className="w-full h-full"
            />
          </div>
          <div className="card !p-5">
            <h1 className="font-extrabold text-xl">{service.name}</h1>
            <p className="text-sm text-fasty-gray mt-1">{service.shortDescription}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-fasty-gray">Service</span>
                <span className="font-semibold">₹{service.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fasty-gray">Taxes (5%)</span>
                <span className="font-semibold">₹{tax}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-gray-100">
                <span className="font-bold">Total</span>
                <span className="font-extrabold">₹{total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Booking type */}
          {supportsScheduling && (
            <div className="card !p-5">
              <h2 className="font-bold mb-3">When do you need it?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBookingType('instant')}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    bookingType === 'instant' ? 'border-fasty-yellow bg-fasty-yellow/5' : 'border-gray-200'
                  }`}
                >
                  <p className="font-bold">⚡ Instant</p>
                  <p className="text-xs text-fasty-gray mt-1">Nearest pro in 15-20 min</p>
                </button>
                <button
                  onClick={() => setBookingType('scheduled')}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    bookingType === 'scheduled' ? 'border-fasty-yellow bg-fasty-yellow/5' : 'border-gray-200'
                  }`}
                >
                  <p className="font-bold">📅 Scheduled</p>
                  <p className="text-xs text-fasty-gray mt-1">Pick a convenient slot</p>
                </button>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="card !p-5">
            <h2 className="font-bold mb-3">Service address</h2>
            <div className="space-y-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAddressId(a.id);
                    setAddingNew(false);
                  }}
                  className={`w-full text-left rounded-xl border-2 p-3 transition ${
                    selectedAddressId === a.id && !addingNew
                      ? 'border-fasty-yellow bg-fasty-yellow/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">
                    {a.label} {a.isDefault && <span className="text-xs text-fasty-yellow">· Default</span>}
                  </p>
                  <p className="text-xs text-fasty-gray">
                    {[a.line1, a.city, a.pincode].filter(Boolean).join(', ')}
                  </p>
                </button>
              ))}
              <button
                onClick={() => {
                  setAddingNew(true);
                  setSelectedAddressId(null);
                }}
                className={`w-full text-left rounded-xl border-2 border-dashed p-3 transition ${
                  addingNew ? 'border-fasty-yellow bg-fasty-yellow/5' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm">+ Add a new address</p>
              </button>
            </div>

            {addingNew && (
              <div className="space-y-3 mt-4">
                <input
                  value={newAddr.line1}
                  onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                  placeholder="House no., street, landmark"
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="City"
                    className="input-field"
                  />
                  <input
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    placeholder="Pincode"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Slots */}
          {bookingType === 'scheduled' && (
            <div className="card !p-5">
              <h2 className="font-bold mb-3">Choose date & time</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {days.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDate(d.value)}
                    className={`chip border whitespace-nowrap ${
                      date === d.value
                        ? 'bg-fasty-black text-white border-fasty-black'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-12" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-fasty-gray">No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.slotId}
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s.slotId)}
                      className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition ${
                        selectedSlot === s.slotId
                          ? 'border-fasty-yellow bg-fasty-yellow text-fasty-black'
                          : s.available
                            ? 'border-gray-200 hover:border-fasty-black'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {s.window.replace('-', ':00 - ')}:00
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={handleConfirm} disabled={submitting} className="btn-primary w-full text-lg">
            {submitting ? 'Confirming...' : `Confirm & Pay ₹${total}`}
          </button>
          <p className="text-xs text-center text-fasty-gray">
            Secure payment · Test mode enabled · Pay after service available
          </p>
        </div>
      </div>
    </div>
  );
}
