'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CategoryCard from '@/components/CategoryCard';
import SectionHeader from '@/components/SectionHeader';
import { getCategories, Category } from '@/lib/api';
import { accentFor } from '@/lib/content';
import { HERO_IMAGE, WHY_US, TESTIMONIALS, FAQ, STATS, SITE } from '@/lib/content';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = categories.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-fasty-black text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Professional home service"
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-fasty-black via-fasty-black/90 to-fasty-black/40" />
        </div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-fasty-yellow/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-fasty-yellow/10 border border-fasty-yellow/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-fasty-yellow rounded-full animate-pulse" />
              <span className="text-fasty-yellow text-sm font-semibold">
                Live in Delhi NCR · 15-20 min guarantee
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Premium home services,{' '}
              <span className="text-gradient-yellow">delivered fast.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {SITE.tagline}. AC repair, RO servicing, instant maid, appliance repair & deep
              cleaning - verified pros at your door in minutes, not hours.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/categories" className="btn-primary text-base">
                Explore Services
              </Link>
              <Link href="/login" className="btn-ghost-white text-base">
                Sign in / Register
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {TESTIMONIALS.map((t) => (
                  <Image
                    key={t.name}
                    src={t.avatar}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-fasty-black object-cover"
                  />
                ))}
              </div>
              <span>
                <strong className="text-white">4.8★</strong> from 50,000+ happy homes
              </span>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-up">
            {(loading ? Array.from({ length: 4 }) : featured).map((cat, i) => {
              const c = cat as Category | undefined;
              if (!c) return <div key={i} className="h-44 rounded-2xl skeleton" />;
              return (
                <Link
                  key={c.id}
                  href={`/categories?cat=${c.slug}`}
                  className="relative h-44 rounded-2xl overflow-hidden group border border-white/10"
                >
                  {c.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${accentFor(c.slug)}`}>
                      <span className="absolute top-4 left-4 text-4xl group-hover:scale-110 transition-transform">
                        {c.icon || '🛠️'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className={`font-bold text-sm ${c.imageUrl ? 'text-white' : 'text-fasty-black'}`}>{c.name}</p>
                    <p className={`text-xs font-semibold ${c.imageUrl ? 'text-fasty-yellow' : 'text-fasty-black/60'}`}>
                      {(c.services?.length ?? 0)} services
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-fasty-yellow border-y-4 border-fasty-black">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-fasty-black">{s.value}</div>
              <div className="text-sm font-semibold text-fasty-black/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-fasty-light py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-semibold text-fasty-gray">
          {['Background verified staff', 'OTP-secured jobs', 'Transparent pricing', 'UPI & card payments', 'Live job tracking'].map(
            (item) => (
              <span key={item} className="text-fasty-black/70">✓ {item}</span>
            ),
          )}
        </div>
      </section>

      {/* Services grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <SectionHeader
          eyebrow="Our Services"
          title="Everything your home needs"
          subtitle="Handpicked categories with trained professionals, genuine parts, and upfront pricing."
        />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 max-w-6xl mx-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="card-flat text-center py-16 text-fasty-gray">
            <p className="font-semibold">Services are being set up.</p>
            <p className="text-sm mt-1">Please check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 max-w-6xl mx-auto">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/categories" className="btn-outline">
            View all services & pricing
          </Link>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-fasty-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            eyebrow="Why Fasty-24"
            title="Built for speed, trust & quality"
            subtitle="A premium service experience with hyper-local 15-20 minute dispatch."
            align="center"
            dark
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="glass-dark rounded-2xl overflow-hidden hover:border-fasty-yellow/40 transition-colors group"
              >
                <div className="relative h-40">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    sizes="250px"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-fasty-yellow mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <SectionHeader
          eyebrow="Simple process"
          title="Book in under 60 seconds"
          subtitle="No calls, no waiting on hold. Just tap, pay, and relax."
          align="center"
        />
        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-fasty-yellow/30" />
          {[
            { step: '01', title: 'Choose service', desc: 'Browse categories with real photos & upfront prices', icon: '📱' },
            { step: '02', title: 'Book & pay', desc: 'Add address, pay securely - instant or scheduled', icon: '💳' },
            { step: '03', title: 'Pro assigned', desc: 'Nearest verified staff accepts in seconds via smart dispatch', icon: '⚡' },
            { step: '04', title: 'Job done', desc: 'OTP verification at start & finish. Rate your experience', icon: '✅' },
          ].map((s) => (
            <div key={s.step} className="text-center relative">
              <div className="w-20 h-20 bg-fasty-black text-fasty-yellow font-extrabold text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lift relative z-10">
                {s.icon}
              </div>
              <span className="text-xs font-bold text-fasty-yellow tracking-widest">{s.step}</span>
              <h3 className="font-bold text-lg mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-fasty-gray leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-fasty-light py-20">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader eyebrow="Customer stories" title="Loved by thousands of homes" align="center" />
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card !p-6 flex flex-col">
                <div className="flex gap-1 text-fasty-yellow mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-fasty-black/80 leading-relaxed flex-1 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  <Image src={t.avatar} alt={t.name} width={48} height={48} className="rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-fasty-gray">
                      {t.city} · {t.service}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities + CTA split */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative h-80 lg:h-[420px] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80"
              alt="City skyline"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-fasty-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-fasty-yellow font-bold text-sm uppercase tracking-wider mb-2">Now serving</p>
              <div className="flex flex-wrap gap-2">
                {SITE.cities.map((city) => (
                  <span
                    key={city}
                    className="bg-white/10 backdrop-blur text-white text-sm font-semibold px-3 py-1 rounded-full border border-white/20"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow="Get started"
              title="Your home deserves the best"
              subtitle="Book instantly from the web. First-time users get priority dispatch."
            />
            <ul className="space-y-4 mb-8">
              {['No subscription fees', 'Pay after service option', '24/7 customer support', 'Add-ons during live jobs'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-fasty-black/80">
                    <span className="w-6 h-6 bg-fasty-yellow rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
            <Link href="/categories" className="btn-primary text-lg">
              Book a service now
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-fasty-black text-white py-20">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeader eyebrow="FAQ" title="Questions? We've got answers." align="center" dark />
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="glass-dark rounded-xl p-5 group open:border-fasty-yellow/30">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center gap-4">
                  {item.q}
                  <span className="text-fasty-yellow text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="relative bg-fasty-yellow rounded-3xl p-10 md:p-16 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-fasty-black/5 rounded-full" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-fasty-black/5 rounded-full" />
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-fasty-black mb-4">
              Ready for lightning-fast home service?
            </h2>
            <p className="text-fasty-black/70 mb-8 text-lg">
              Join 50,000+ customers who trust Fasty-24 for repairs, cleaning & more.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/categories" className="btn-dark">
                Browse Services
              </Link>
              <Link href="/login" className="border-2 border-fasty-black text-fasty-black font-bold px-8 py-4 rounded-xl hover:bg-fasty-black hover:text-fasty-yellow transition">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
