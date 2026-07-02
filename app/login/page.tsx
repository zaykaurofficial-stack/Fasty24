'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  requestOtp,
  verifyOtp,
  completeProfile,
  setAuth,
  getUser,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';

type Step = 'phone' | 'otp' | 'profile';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [registrationToken, setRegistrationToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getUser()) router.replace(redirect);
  }, [redirect, router]);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s+/g, '');
    if (!cleaned.match(/^(\+91)?[6-9][0-9]{9}$/)) {
      toast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(cleaned);
      if (res.devCode) toast(`Dev OTP: ${res.devCode}`, 'info');
      else toast('OTP sent to your phone', 'success');
      setStep('otp');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 4) {
      toast('Please enter the OTP', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone.replace(/\s+/g, ''), otp);
      if (res.needsProfile && res.registrationToken) {
        setRegistrationToken(res.registrationToken);
        setStep('profile');
      } else if (res.token && res.principal) {
        setAuth(res.token, res.principal);
        toast(`Welcome back, ${res.principal.name || 'there'}!`, 'success');
        router.push(redirect);
      }
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please enter your name', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await completeProfile(registrationToken, { name: name.trim(), gender });
      if (res.token && res.principal) {
        setAuth(res.token, res.principal);
        toast('Welcome to Fasty-24! 🎉', 'success');
        router.push(redirect);
      }
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  const stepTitles: Record<Step, { heading: string; subheading: string }> = {
    phone: { heading: 'Welcome back', subheading: 'Sign in with your mobile number' },
    otp: { heading: 'Verify OTP', subheading: `Enter the 6-digit code sent to ${phone}` },
    profile: { heading: 'Complete your profile', subheading: 'Just a few details to get started' },
  };

  const { heading, subheading } = stepTitles[step];

  return (
    <main className="min-h-screen flex bg-fasty-black overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-12 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80"
            alt="Home service"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-fasty-black via-fasty-black/70 to-fasty-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-fasty-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
            <span className="bg-fasty-yellow text-fasty-black font-extrabold text-lg px-4 py-1.5 rounded-lg">Fasty</span>
            <span className="font-extrabold text-fasty-yellow text-lg">24</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Join 50,000+ <br /> happy homes
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Trusted professionals in minutes. OTP-secured, transparent pricing, absolute peace of mind.
          </p>
          <div className="space-y-3">
            {['15-20 min guaranteed arrival', 'Background-verified professionals', 'OTP-secured start & finish', 'Free cancellation before assignment'].map((point) => (
              <div key={point} className="flex items-center gap-3 text-gray-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-fasty-yellow/20 border border-fasty-yellow/40 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-fasty-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-fasty-yellow/8 blur-[120px] pointer-events-none rounded-full" />

        <div className="w-full max-w-md relative z-10 animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="bg-fasty-yellow text-fasty-black font-extrabold text-2xl px-4 py-2 rounded-xl">Fasty</span>
              <span className="font-extrabold text-fasty-yellow text-2xl">24</span>
            </Link>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {(['phone', 'otp', 'profile'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all ${
                  step === s ? 'bg-fasty-yellow w-6' : i < (['phone', 'otp', 'profile'] as Step[]).indexOf(step) ? 'bg-fasty-yellow/60' : 'bg-white/20'
                }`} />
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2">{heading}</h2>
            <p className="text-gray-400">{subheading}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">

            {/* Step 1: Phone */}
            {step === 'phone' && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-20 pr-4 py-4 bg-fasty-black/60 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-fasty-yellow/60 focus:ring-1 focus:ring-fasty-yellow/30 transition-all placeholder:text-gray-600"
                      placeholder="98765 43210"
                      autoComplete="tel"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-fasty-yellow text-fasty-black font-extrabold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(255,196,0,0.25)] hover:shadow-[0_4px_30px_rgba(255,196,0,0.45)] hover:-translate-y-0.5 hover:bg-yellow-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-fasty-black/30 border-t-fasty-black rounded-full animate-spin" />
                      Sending OTP…
                    </span>
                  ) : 'Continue with OTP'}
                </button>
                <p className="text-center text-xs text-gray-500">
                  Dev mode: OTP is <span className="text-fasty-yellow font-bold">000000</span>
                </p>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 bg-fasty-black/60 border border-white/10 rounded-xl text-white text-xl font-bold tracking-[0.5em] text-center focus:outline-none focus:border-fasty-yellow/60 focus:ring-1 focus:ring-fasty-yellow/30 transition-all placeholder:text-gray-600 placeholder:tracking-normal"
                    placeholder="______"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-fasty-yellow text-fasty-black font-extrabold text-lg py-4 rounded-xl hover:bg-yellow-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-fasty-black/30 border-t-fasty-black rounded-full animate-spin" />
                      Verifying…
                    </span>
                  ) : 'Verify & Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="w-full text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
                >
                  ← Change number
                </button>
              </form>
            )}

            {/* Step 3: Profile */}
            {step === 'profile' && (
              <form onSubmit={handleCompleteProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-4 bg-fasty-black/60 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-fasty-yellow/60 focus:ring-1 focus:ring-fasty-yellow/30 transition-all placeholder:text-gray-600"
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-4 bg-fasty-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-fasty-yellow/60 focus:ring-1 focus:ring-fasty-yellow/30 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full bg-fasty-yellow text-fasty-black font-extrabold text-lg py-4 rounded-xl hover:bg-yellow-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-fasty-black/30 border-t-fasty-black rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : 'Complete Setup →'}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-600 leading-relaxed">
            By continuing, you agree to Fasty-24&apos;s{' '}
            <a href="#" className="text-fasty-yellow hover:underline">Terms of Service</a> and{' '}
            <Link href="/privacy" className="text-fasty-yellow hover:underline">Privacy Policy</Link>.
          </p>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-fasty-yellow font-medium transition-colors group text-sm">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-fasty-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fasty-yellow/20 border-t-fasty-yellow rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
