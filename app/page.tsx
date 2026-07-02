'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import Hero from '@/components/Hero';
import { getCategories, Category, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import { SERVICE_ICONS, WHY_US, TESTIMONIALS, FAQ, STATS, SITE } from '@/lib/content';

function ServicesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
      {categories.slice(0, 6).map((cat) => {
        const icon = SERVICE_ICONS[cat.slug] || '🛠️';
        const minPrice = (cat.services ?? []).length > 0
          ? Math.min(...(cat.services ?? []).map((s) => s.price))
          : null;
        return (
          <Link
            key={cat.id}
            href={`/categories?cat=${cat.slug}`}
            className="group relative flex flex-col bg-[#141414] border border-white/8 rounded-3xl overflow-hidden hover:border-fasty-yellow/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-16px_rgba(255,196,0,0.15)]"
          >
            {/* Image / Icon area */}
            <div className="relative h-48 overflow-hidden">
              {cat.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                  <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">{icon}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
              {minPrice !== null && (
                <span className="absolute top-3 left-3 bg-fasty-yellow text-fasty-black text-xs font-extrabold px-3 py-1.5 rounded-full">
                  From ₹{minPrice}
                </span>
              )}
            </div>
            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-fasty-yellow transition-colors duration-300">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                {cat.description || 'Trusted professionals, transparent pricing, fast arrival.'}
              </p>
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-gray-500">{(cat.services ?? []).length} services</span>
                <span className="text-xs font-bold text-fasty-yellow group-hover:translate-x-0.5 transition-transform">
                  Explore →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-fasty-black text-white overflow-hidden">

      {/* 1. HERO */}
      <Hero />

      {/* 2. TRUST BAR */}
      <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-gradient-to-r from-fasty-yellow to-yellow-400 rounded-3xl shadow-[0_20px_40px_-15px_rgba(255,196,0,0.3)] p-8 md:p-10 text-fasty-black border border-yellow-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-fasty-black/10 border-b border-fasty-black/10 pb-8 mb-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center px-4 hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{s.value}</div>
                <div className="text-xs md:text-sm font-bold opacity-70 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-bold">
            {['Background verified staff', 'OTP-secured jobs', 'Transparent pricing', 'UPI & card payments', 'Live job tracking'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICES GRID — live from API */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader
          eyebrow="Our Services"
          title="Everything your home needs"
          subtitle="Handpicked categories with trained professionals, genuine parts, and upfront pricing."
          dark
        />
        <ServicesSection />
        <div className="text-center mt-16">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:border-fasty-yellow hover:text-fasty-yellow hover:bg-white/5 transition-all duration-300"
          >
            View all services & pricing
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 4. WHY FASTY-24 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-fasty-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        <SectionHeader
          eyebrow="Why Fasty-24"
          title="Built for speed, trust & quality"
          subtitle="Premium service experience, right at your doorstep."
          align="center"
          dark
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 relative z-10">
          {WHY_US.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(255,196,0,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-fasty-yellow to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              <div className="w-14 h-14 bg-fasty-black/80 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-fasty-yellow/50 transition-all duration-500">
                <span className="text-2xl">{(item as any).icon || '✨'}</span>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-3 group-hover:text-fasty-yellow transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="relative py-24 overflow-hidden border-t border-white/5">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <SectionHeader eyebrow="Simple Process" title="Book in under 60 seconds" subtitle="No calls, no waiting. Just tap, pay, and relax." align="center" dark />
          <div className="relative mt-20 max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-fasty-yellow/30 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                { step: '01', title: 'Choose service', desc: 'Browse with real photos & upfront pricing', icon: '📱' },
                { step: '02', title: 'Book & pay', desc: 'Add address, pay via UPI or card securely', icon: '💳' },
                { step: '03', title: 'Pro assigned', desc: 'Nearest verified staff accepts in seconds', icon: '⚡' },
                { step: '04', title: 'Job done', desc: 'OTP verification at start & finish', icon: '✅' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-3xl bg-fasty-black border border-white/10 group-hover:border-fasty-yellow/60 flex items-center justify-center text-3xl shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_12px_30px_-8px_rgba(255,196,0,0.25)] mb-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-fasty-yellow/0 group-hover:bg-fasty-yellow/8 transition-colors duration-500" />
                    <span className="relative z-10">{s.icon}</span>
                  </div>
                  <span className="text-fasty-black font-extrabold text-[10px] tracking-widest mb-3 bg-fasty-yellow px-3.5 py-1 rounded-full">
                    STEP {s.step}
                  </span>
                  <h3 className="font-bold text-lg text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed px-2">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="relative py-24 bg-fasty-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader eyebrow="Customer Stories" title="Loved by thousands of homes" align="center" dark />
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {TESTIMONIALS.map((t, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-fasty-yellow/30 transition-all duration-300 hover:-translate-y-2 group flex flex-col justify-between h-full">
                <div>
                  <div className="flex gap-1 text-fasty-yellow mb-5">
                    {Array.from({ length: (t as any).rating || 5 }).map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed italic mb-6 text-base">&ldquo;{t.text}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={(t as any).avatar || 'https://i.pravatar.cc/150'} alt={t.name} className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-fasty-yellow transition-colors object-cover" />
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    {(t as any).city && <p className="text-xs text-fasty-yellow font-medium mt-0.5">{(t as any).city} · {(t as any).service}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
        <div className="relative h-80 lg:h-96 rounded-[2.5rem] overflow-hidden group border border-white/10 shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80"
            alt="City"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-fasty-black via-fasty-black/70 to-fasty-black/10" />
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-fasty-yellow text-fasty-black text-xs font-extrabold uppercase tracking-widest mb-4">
              Now Serving
            </div>
            <div className="flex flex-wrap gap-3">
              {SITE.cities.map((city) => (
                <span key={city} className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-fasty-yellow hover:text-fasty-black hover:border-fasty-yellow transition-all duration-300 cursor-default">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="bg-fasty-black relative py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title="Questions? We've got answers." align="center" dark />
          <div className="space-y-3 mt-12">
            {FAQ.map((item, index) => (
              <details key={index} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fasty-yellow/40 transition-colors duration-300 cursor-pointer overflow-hidden">
                <summary className="font-bold list-none flex justify-between items-center gap-4 text-white outline-none">
                  <span className="text-base group-hover:text-fasty-yellow transition-colors">{item.q}</span>
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-open:bg-fasty-yellow shrink-0 transition-colors">
                    <svg className="w-3.5 h-3.5 text-white group-open:text-fasty-black transition-transform duration-300 group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-400 mt-4 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative bg-gradient-to-br from-fasty-yellow to-yellow-500 rounded-[2.5rem] p-10 md:p-16 overflow-hidden shadow-[0_20px_60px_-15px_rgba(255,196,0,0.4)]">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/30 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-fasty-black/10 blur-2xl rounded-full pointer-events-none" />
          <div className="relative text-center max-w-2xl mx-auto z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-fasty-black mb-5 tracking-tight leading-tight">
              Ready for lightning-fast<br className="hidden md:block" /> home service?
            </h2>
            <p className="text-fasty-black/75 mb-10 text-lg font-medium">
              Join 50,000+ customers who trust Fasty-24 for repairs, cleaning & more.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/categories" className="bg-fasty-black text-fasty-yellow font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-900 hover:scale-105 hover:shadow-2xl transition-all duration-300">
                Browse Services
              </Link>
              <Link href="/login" className="bg-transparent border-2 border-fasty-black text-fasty-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-fasty-black/8 hover:scale-105 transition-all duration-300">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
