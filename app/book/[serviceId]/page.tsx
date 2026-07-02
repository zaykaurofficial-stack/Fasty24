'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function BookingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get service details from URL
  const name = searchParams.get('name') || 'Premium Home Service';
  const cat = searchParams.get('cat') || 'Fasty-24 Services';
  const img = searchParams.get('img') || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80';
  
  const [step, setStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today');

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <main className="min-h-screen bg-fasty-black pt-24 pb-32 relative overflow-hidden flex flex-col items-center">
      
      {/* Ambient background glows */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-[#F97316]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl px-4 sm:px-6 relative z-10 animate-fade-up">
        
        {/* Header & Progress Bar */}
        <div className="mb-10">
          <button onClick={() => step === 1 ? router.back() : handleBack()} className="text-gray-400 hover:text-[#F97316] transition-colors mb-6 flex items-center gap-2 font-medium">
            <span>←</span> {step === 1 ? 'Back to Services' : 'Previous Step'}
          </button>
          
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Complete your booking</h1>
            <span className="text-[#F97316] font-bold text-sm bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">Step {step} of 3</span>
          </div>

          {/* Progress Indicator */}
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
            <div className={`h-full bg-[#F97316] transition-all duration-500 ease-out ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
          </div>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl">
          
          {/* STEP 1: Service Summary */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-fasty-black/50 p-4 rounded-2xl border border-white/5">
                <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0">
                  <Image src={img} alt={name} fill className="object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest">{cat}</span>
                  <h2 className="text-2xl font-bold text-white mt-1 mb-2">{name}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">Background verified professional will arrive with genuine parts and equipment.</p>
                  <div className="inline-block bg-white/10 text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
                    Estimated Time: 45-60 mins
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Service Total</p>
                  <p className="text-3xl font-extrabold text-white">₹499</p>
                </div>
                <button onClick={handleNext} className="bg-[#F97316] text-white font-extrabold px-8 py-4 rounded-xl hover:bg-orange-600 hover:scale-105 transition-all duration-300 shadow-[0_4px_20px_rgba(249,115,22,0.3)]">
                  Select Time →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">When do you need it?</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {['Today', 'Tomorrow', 'Day after'].map((day) => (
                    <button 
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition-all ${selectedDate === day ? 'bg-[#F97316] text-white shadow-lg' : 'bg-fasty-black/50 text-gray-400 border border-white/10 hover:border-[#F97316]/50'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Select arrival time</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Within 30 mins (Fast Track)', '09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'].map((time, idx) => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center text-center ${selectedTime === time ? 'bg-[#F97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-fasty-black/50 text-gray-300 border border-white/10 hover:bg-white/10'} ${idx === 0 ? 'col-span-2 sm:col-span-3 border-[#F97316]/40' : ''}`}
                    >
                      {idx === 0 && <span className="mr-2 animate-pulse">⚡</span>}
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button 
                  onClick={handleNext} 
                  disabled={!selectedTime}
                  className={`font-extrabold px-8 py-4 rounded-xl transition-all duration-300 ${selectedTime ? 'bg-[#F97316] text-white hover:bg-orange-600 hover:scale-105 shadow-[0_4px_20px_rgba(249,115,22,0.3)]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                  Enter Address →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Address & Checkout */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <h3 className="text-xl font-bold text-white mb-2">Where should we arrive?</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">House/Flat Number</label>
                  <input type="text" placeholder="e.g. Flat 402, Block B" className="w-full px-4 py-3 bg-fasty-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F97316]/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Landmark</label>
                  <input type="text" placeholder="e.g. Near Apollo Pharmacy" className="w-full px-4 py-3 bg-fasty-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F97316]/50 transition-colors" />
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-fasty-black/50 p-5 rounded-2xl border border-white/5 mt-6">
                <h4 className="text-white font-bold mb-4">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400"><span>{name}</span><span>₹499</span></div>
                  <div className="flex justify-between text-gray-400"><span>Safety & Hygiene Fee</span><span>₹29</span></div>
                  <div className="flex justify-between font-bold text-white pt-3 border-t border-white/10 text-lg">
                    <span>Total Amount</span><span className="text-[#F97316]">₹528</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 text-center sm:text-right">
                <Link href="/" className="inline-block w-full sm:w-auto bg-[#F97316] text-white font-extrabold px-10 py-4 rounded-xl hover:bg-orange-600 hover:scale-105 transition-all duration-300 shadow-[0_4px_20px_rgba(249,115,22,0.4)]">
                  Pay & Book ₹528
                </Link>
                <p className="text-xs text-gray-500 mt-4 flex items-center justify-center sm:justify-end gap-1">
                  <span>🔒</span> Secure 128-bit encrypted checkout
                </p>
              </div>
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
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-[#F97316]/20 border-t-[#F97316] rounded-full animate-spin" />
          <div className="animate-pulse text-[#F97316] font-bold tracking-widest uppercase text-sm">Loading Booking...</div>
        </div>
      </div>
    }>
      <BookingFlow />
    </Suspense>
  );
}