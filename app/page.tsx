import Image from 'next/image';
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';
import SectionHeader from '@/components/SectionHeader';
import Hero from '@/components/Hero';

import {
  CATEGORIES_RICH,
  WHY_US,
  TESTIMONIALS,
  FAQ,
  STATS,
  SITE,
} from '@/lib/content';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-fasty-black text-white overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. FLOATING STATS & TRUST BAR */}
      <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-gradient-to-r from-fasty-yellow to-yellow-400 rounded-3xl shadow-[0_20px_40px_-15px_rgba(255,215,0,0.3)] p-8 md:p-10 text-fasty-black border border-yellow-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-fasty-black/10 border-b border-fasty-black/10 pb-8 mb-8">
            {STATS.map((s: any, i: number) => (
              <div key={i} className="text-center px-4 hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-sm">{s.value}</div>
                <div className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm md:text-base font-bold">
            {['Background verified staff', 'OTP-secured jobs', 'Transparent pricing', 'UPI & card payments', 'Live job tracking'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-fasty-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <SectionHeader
          eyebrow="Our Services"
          title="Everything your home needs"
          subtitle="Handpicked categories with trained professionals, genuine parts, and upfront pricing."
          dark
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {CATEGORIES_RICH.map((cat: any, index: number) => (
            <ServiceCard 
              key={cat.id || index} 
              id={cat.id || `service-${index}`}
              name={cat.title || cat.name || 'Premium Home Service'}
              image={cat.image || cat.src || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000'}
              price={cat.price || 499}
              description={cat.description || 'Verified professionals at your doorstep.'}
              categoryName={cat.category || 'Fasty-24'}
            />
          ))}
        </div>
        <div className="text-center mt-16">
          <Link href="/categories" className="inline-block border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:border-fasty-yellow hover:text-fasty-yellow hover:bg-white/5 transition-all duration-300">
            View all services & pricing
          </Link>
        </div>
      </section>

      {/* 4. WHY FASTY-24 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-fasty-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        <SectionHeader 
          eyebrow="Why Fasty-24" 
          title="Built for speed, trust & quality" 
          subtitle="Urban Company-grade service experience, right at your doorstep." 
          align="center" 
          dark 
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 relative z-10">
          {WHY_US.map((item: any, index: number) => (
            <div 
              key={index} 
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(255,215,0,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fasty-yellow to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left" />
              <div className="w-16 h-16 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-fasty-yellow/50 group-hover:shadow-[0_0_25px_rgba(255,215,0,0.2)] transition-all duration-500">
                <span className="text-3xl filter drop-shadow-md group-hover:drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] transition-all duration-300">
                  {item.icon || '✨'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-fasty-yellow transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {item.desc || item.description}
              </p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fasty-yellow/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. SIMPLE PROCESS TIMELINE */}
      <section className="relative py-24 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <SectionHeader eyebrow="Simple Process" title="Book in under 60 seconds" subtitle="No calls, no waiting on hold. Just tap, pay, and relax." align="center" dark />
          <div className="relative mt-20 max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-white/10 rounded-full">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fasty-yellow to-transparent opacity-50 shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                { step: '01', title: 'Choose service', desc: 'Browse categories with real photos & upfront prices', icon: '📱' },
                { step: '02', title: 'Book & pay', desc: 'Add address, pay via UPI/card — secure checkout', icon: '💳' },
                { step: '03', title: 'Pro assigned', desc: 'Nearest verified staff accepts in seconds via smart dispatch', icon: '⚡' },
                { step: '04', title: 'Job done', desc: 'OTP verification at start & finish. Rate your experience', icon: '✅' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-3xl bg-fasty-black border border-white/10 group-hover:border-fasty-yellow/70 flex items-center justify-center text-4xl shadow-xl transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_15px_35px_-10px_rgba(255,215,0,0.3)] mb-6 relative overflow-hidden">
                     <div className="absolute inset-0 bg-fasty-yellow/0 group-hover:bg-fasty-yellow/10 transition-colors duration-500" />
                     <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">{s.icon}</span>
                  </div>
                  <span className="text-fasty-black font-extrabold text-xs tracking-widest mb-4 bg-fasty-yellow px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.3)]">STEP {s.step}</span>
                  <h3 className="font-bold text-xl text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed px-2">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER STORIES */}
      <section className="relative py-24 bg-fasty-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader eyebrow="Customer Stories" title="Loved by thousands of homes" align="center" dark />
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {TESTIMONIALS.map((t: any, index: number) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-fasty-yellow/30 transition-all duration-300 hover:-translate-y-2 group flex flex-col justify-between h-full">
                <div>
                  <div className="flex gap-1 text-fasty-yellow mb-6">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <span key={i} className="text-xl drop-shadow-md">★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed italic mb-8 text-lg">&ldquo;{t.text}&rdquo;</p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-fasty-black group-hover:border-fasty-yellow transition-colors">
                    <Image src={t.avatar || 'https://i.pravatar.cc/150'} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-fasty-yellow font-medium mt-0.5">{t.city} • {t.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CITY SKYLINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
        <div className="relative h-96 lg:h-[400px] rounded-[2.5rem] overflow-hidden group border border-white/10 shadow-2xl">
          <Image src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80" alt="City skyline" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 1200px" />
          <div className="absolute inset-0 bg-gradient-to-t from-fasty-black via-fasty-black/80 to-fasty-black/20" />
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-fasty-yellow text-fasty-black text-xs font-extrabold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(255,215,0,0.4)]">Now Serving</div>
            <div className="flex flex-wrap gap-3">
              {SITE.cities.map((city: string) => (
                <span key={city} className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-fasty-yellow hover:text-fasty-black hover:border-fasty-yellow transition-all duration-300 cursor-default">{city}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="bg-fasty-black relative py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader eyebrow="FAQ" title="Questions? We've got answers." align="center" dark />
          <div className="space-y-4 mt-12">
            {FAQ.map((item: any, index: number) => (
              <details key={index} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fasty-yellow/40 transition-colors duration-300 cursor-pointer overflow-hidden">
                <summary className="font-bold list-none flex justify-between items-center gap-4 text-white outline-none">
                  <span className="text-lg group-hover:text-fasty-yellow transition-colors">{item.q}</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-open:bg-fasty-yellow transition-colors shrink-0">
                    <svg className="w-4 h-4 text-white group-open:text-fasty-black transition-transform duration-300 group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-400 mt-4 text-base leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative bg-gradient-to-br from-fasty-yellow to-yellow-500 rounded-[2.5rem] p-10 md:p-16 overflow-hidden shadow-[0_20px_50px_-15px_rgba(255,215,0,0.4)]">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/30 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-fasty-black/10 blur-2xl rounded-full pointer-events-none" />
          
          <div className="relative text-center max-w-3xl mx-auto z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-fasty-black mb-6 tracking-tight leading-tight">Ready for lightning-fast <br className="hidden md:block" /> home service?</h2>
            <p className="text-fasty-black/80 mb-10 text-lg md:text-xl font-medium">Join 50,000+ customers who trust Fasty-24 for repairs, cleaning & more.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/categories" className="bg-fasty-black text-fasty-yellow font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-900 hover:scale-105 hover:shadow-2xl transition-all duration-300">Browse Services</Link>
              <Link href="/login" className="bg-transparent border-2 border-fasty-black text-fasty-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-fasty-black/5 hover:scale-105 transition-all duration-300">Create Account</Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}