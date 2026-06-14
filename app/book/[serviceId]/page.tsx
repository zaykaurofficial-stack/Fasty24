'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBooking, getUser } from '@/lib/api';
import { HERO_IMAGE } from '@/lib/content';

function BookContent({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const serviceName = params.get('name') ?? 'Service';
  const categoryName = params.get('cat') ?? '';
  const imageUrl = params.get('img') || HERO_IMAGE;

  const [address, setAddress] = useState('123, Main Street, Block A');
  const [city, setCity] = useState('Delhi');
  const [pincode, setPincode] = useState('110001');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleBook() {
    if (!getUser()) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        serviceId,
        serviceName,
        address: { line1: address, city, pincode, lat: 28.6139, lng: 77.209 },
      });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-fasty-yellow rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-yellow-200">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold mb-2">You&apos;re all set!</h1>
          <p className="text-fasty-gray mb-1 font-semibold">{serviceName}</p>
          <p className="text-sm text-fasty-gray mb-8">{categoryName}</p>
          <div className="bg-fasty-black text-white rounded-2xl p-6 mb-8">
            <p className="text-fasty-yellow font-bold text-lg mb-1">⚡ Arriving in 15–20 mins</p>
            <p className="text-gray-400 text-sm">We&apos;re matching you with the nearest verified professional</p>
          </div>
          <Link href="/bookings" className="btn-primary inline-block w-full">
            Track my booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/categories" className="text-sm font-semibold text-fasty-gray hover:text-fasty-yellow">
        ← Back to services
      </Link>

      <div className="grid lg:grid-cols-5 gap-8 mt-6">
        <div className="lg:col-span-2">
          <div className="relative h-56 lg:h-72 rounded-2xl overflow-hidden mb-4">
            <Image src={imageUrl} alt={serviceName} fill className="object-cover" sizes="400px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="text-fasty-yellow text-xs font-bold uppercase tracking-wider">{categoryName}</p>
              <h1 className="text-white font-extrabold text-2xl">{serviceName}</h1>
            </div>
          </div>
          <div className="card !p-5 space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-fasty-gray">Included</h3>
            {['Professional inspection', 'Genuine parts & materials', '30-day service warranty', 'OTP-verified completion'].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-fasty-yellow">✓</span>
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card border-2 border-fasty-yellow/20 !p-6 lg:!p-8">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm text-fasty-gray">Total payable</p>
                <p className="text-4xl font-extrabold">₹499</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-fasty-gray">Arrival</p>
                <p className="font-bold text-fasty-yellow">15–20 min</p>
              </div>
            </div>

            <h2 className="font-bold mb-4">Service address</h2>
            <div className="space-y-4 mb-8">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, landmark"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-fasty-yellow focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-fasty-yellow focus:outline-none"
                />
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-fasty-yellow focus:outline-none"
                />
              </div>
            </div>

            <button onClick={handleBook} disabled={loading} className="btn-primary w-full text-lg">
              {loading ? 'Confirming...' : 'Confirm & Pay ₹499'}
            </button>
            <p className="text-xs text-center text-fasty-gray mt-4">
              Secure payment · UPI, cards & wallets · Demo mode enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BookPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading...</div>}>
      <BookContent serviceId={serviceId} />
    </Suspense>
  );
}
