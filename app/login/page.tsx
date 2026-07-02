'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { requestOtp, verifyOtp, completeProfile, setAuth, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import Logo from '@/components/Logo';

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/categories';

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [loading, setLoading] = useState(false);
  const [registrationToken, setRegistrationToken] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');

  function finish(token: string, principal: { phone: string; name: string; id: string; role?: string }) {
    setAuth(token, principal);
    toast('Signed in successfully', 'success');
    router.push(redirect);
  }

  async function handleSendOtp() {
    if (!phone.trim()) {
      toast('Enter your phone number', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(phone, 'customer');
      setStep('otp');
      if (res.devCode) toast(`Dev OTP: ${res.devCode}`, 'info');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setLoading(true);
    try {
      const res = await verifyOtp(phone, code || '000000', 'customer');
      if (res.needsProfile && res.registrationToken) {
        setRegistrationToken(res.registrationToken);
        setStep('profile');
      } else if (res.token && res.principal) {
        finish(res.token, { ...res.principal, role: res.role });
      } else {
        toast('Unexpected response. Please try again.', 'error');
      }
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile() {
    if (!name.trim()) {
      toast('Please enter your name', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await completeProfile(registrationToken, { name, gender });
      if (res.token && res.principal) finish(res.token, { ...res.principal, role: res.role });
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-extrabold text-white mb-3">Join 50,000+ happy homes</h2>
          <p className="text-gray-300">Book trusted professionals in minutes. OTP-secured, transparent pricing.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 bg-fasty-light">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo href="/" size="lg" variant="light" />
            </div>
            <h1 className="text-2xl font-extrabold">
              {step === 'profile' ? 'Almost there!' : 'Welcome'}
            </h1>
            <p className="text-fasty-gray mt-1">
              {step === 'phone' && 'Sign in with your mobile number'}
              {step === 'otp' && 'Enter the verification code'}
              {step === 'profile' && 'Tell us a bit about you'}
            </p>
          </div>

          <div className="card shadow-lift !p-8">
            {step === 'phone' && (
              <>
                <label className="block text-sm font-bold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field mb-6 text-lg"
                  placeholder="9876543210"
                />
                <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending OTP...' : 'Continue with OTP'}
                </button>
              </>
            )}

            {step === 'otp' && (
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
                  className="input-field mb-2 text-center text-3xl tracking-[0.5em] font-extrabold"
                  placeholder="······"
                />
                <p className="text-xs text-center text-fasty-gray mb-6">
                  Dev mode: enter <strong className="text-fasty-black">000000</strong>
                </p>
                <button onClick={handleVerify} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Verifying...' : 'Verify & continue'}
                </button>
              </>
            )}

            {step === 'profile' && (
              <>
                <label className="block text-sm font-bold mb-2">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field mb-4"
                  placeholder="Your name"
                />
                <label className="block text-sm font-bold mb-2">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field mb-6">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <button onClick={handleCompleteProfile} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Saving...' : 'Create account'}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
