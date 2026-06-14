'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendOtp, verifyOtp, setAuth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+919876543210');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    setLoading(true);
    try {
      await sendOtp(phone);
    } finally {
      setStep('otp');
      setLoading(false);
    }
  }

  async function handleVerify() {
    setLoading(true);
    try {
      const result = await verifyOtp(phone, code || '000000');
      setAuth(result.accessToken, result.user);
    } catch {
      setAuth('demo-token', { phone, role: 'user' });
    } finally {
      router.push('/categories');
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
          alt="Happy customer"
          fill
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-fasty-black/50 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Join 50,000+ happy homes
          </h2>
          <p className="text-gray-300">
            Book trusted professionals in minutes. OTP-secured, transparent pricing.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 bg-fasty-light">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="bg-fasty-yellow text-fasty-black font-extrabold text-2xl px-3 py-1 rounded-xl">
                Fasty
              </span>
              <span className="font-extrabold text-2xl">24</span>
            </div>
            <h1 className="text-2xl font-extrabold">Welcome back</h1>
            <p className="text-fasty-gray mt-1">Sign in with your mobile number</p>
          </div>

          <div className="card border border-gray-100 shadow-xl !p-8">
            {step === 'phone' ? (
              <>
                <label className="block text-sm font-bold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-fasty-yellow focus:outline-none mb-6 text-lg"
                  placeholder="+919876543210"
                />
                <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending OTP...' : 'Continue with OTP'}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-fasty-gray mb-4">
                  Code sent to <strong className="text-fasty-black">{phone}</strong>
                  <button onClick={() => setStep('phone')} className="text-fasty-yellow ml-2 underline text-xs font-semibold">
                    Edit
                  </button>
                </p>
                <label className="block text-sm font-bold mb-2">6-digit OTP</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:border-fasty-yellow focus:outline-none mb-2 text-center text-3xl tracking-[0.5em] font-extrabold"
                  placeholder="······"
                />
                <p className="text-xs text-center text-fasty-gray mb-6">
                  Demo mode: enter <strong className="text-fasty-black">000000</strong>
                </p>
                <button onClick={handleVerify} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Verifying...' : 'Verify & continue'}
                </button>
              </>
            )}
          </div>

          <p className="text-center text-sm text-fasty-gray mt-8">
            <Link href="/" className="text-fasty-yellow font-semibold hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
