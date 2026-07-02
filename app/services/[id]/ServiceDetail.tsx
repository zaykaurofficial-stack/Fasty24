'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getService, getServices, Service, errorMessage, ApiError } from '@/lib/api';
import ServiceImage from '@/components/ServiceImage';

function Skeleton() {
  return (
    <main className="min-h-screen bg-fasty-black pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-96 rounded-3xl bg-white/5 animate-pulse mb-8" />
        <div className="h-8 w-2/3 rounded-xl bg-white/5 animate-pulse mb-4" />
        <div className="h-4 w-full rounded-xl bg-white/5 animate-pulse mb-2" />
        <div className="h-4 w-4/5 rounded-xl bg-white/5 animate-pulse" />
      </div>
    </main>
  );
}

export default function ServiceDetail({ slug }: { slug: string }) {
  const [service, setService] = useState<Service | null>(null);
  const [related, setRelated] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getService(slug)
      .then((svc) => {
        if (!mounted) return;
        setService(svc);
        setActiveImg(svc.imageUrl || svc.gallery?.[0] || null);
        if (svc.categories?.[0]) {
          getServices(svc.categories[0])
            .then((list) => mounted && setRelated(list.filter((s) => s.slug !== svc.slug).slice(0, 3)))
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <Skeleton />;

  if (notFound || !service) {
    return (
      <main className="min-h-screen bg-fasty-black flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-extrabold text-white mb-2">Service not found</h1>
        <p className="text-gray-400 mb-6">This service may have been removed or renamed.</p>
        <Link href="/categories" className="bg-fasty-yellow text-fasty-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all">
          Browse all services
        </Link>
      </main>
    );
  }

  const accent = service.categories?.[0];
  const thumbs = [service.imageUrl, ...(service.gallery || [])].filter(Boolean) as string[];
  const bookHref = `/book/${service.slug || service.id}`;

  return (
    <main className="min-h-screen bg-fasty-black text-white animate-fade-in">

      {/* Hero */}
      <section className="relative pt-24 pb-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fasty-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-fasty-yellow transition-colors">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-fasty-yellow transition-colors">Services</Link>
            <span>/</span>
            <span className="text-gray-300">{service.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Info */}
            <div>
              {service.categories?.[0] && (
                <span className="inline-block text-fasty-yellow font-bold text-xs uppercase tracking-widest mb-4">
                  {service.categories[0]}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white mb-4">{service.name}</h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {service.shortDescription || service.description || 'Premium home service by verified professionals.'}
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                <span className="inline-flex items-center gap-1.5 bg-fasty-yellow text-fasty-black text-sm font-extrabold px-4 py-2 rounded-full">
                  ₹{service.price}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-full">
                  ~{service.durationMin} min
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-full">
                  🔐 OTP-secured
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-full">
                  ⚡ 15-20 min arrival
                </span>
              </div>

              <Link
                href={bookHref}
                className="inline-flex items-center gap-2 bg-fasty-yellow text-fasty-black font-extrabold px-8 py-4 rounded-xl hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-[0_4px_24px_rgba(255,196,0,0.3)] text-base"
              >
                Book this service
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right: Image */}
            <div>
              <div className="relative h-72 lg:h-80 rounded-3xl overflow-hidden border border-white/10">
                <ServiceImage
                  src={activeImg || undefined}
                  alt={service.name}
                  icon="🛠️"
                  accentSlug={accent}
                  rounded="rounded-3xl"
                  fit="contain"
                  className="w-full h-full"
                  showPlaceholderLabel
                />
              </div>
              {thumbs.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {thumbs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveImg(t)}
                      className={`relative h-16 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImg === t ? 'border-fasty-yellow' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content + sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-10">

        {/* Content */}
        <div className="lg:col-span-2 space-y-14">

          {/* Description */}
          {service.description && (
            <div>
              <div className="mb-6">
                <span className="text-fasty-yellow text-xs font-bold uppercase tracking-widest mb-2 block">Overview</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">About this service</h2>
              </div>
              <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">{service.description}</p>
            </div>
          )}

          {/* Inclusions */}
          {service.inclusions.length > 0 && (
            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What&apos;s included</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.inclusions.map((inc) => (
                  <li key={inc} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-fasty-yellow/20 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-fasty-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          {service.exclusions.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
              <p className="text-xs font-bold text-red-400/70 uppercase tracking-widest mb-4">Not included</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.exclusions.map((exc) => (
                  <li key={exc} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <span className="text-red-400 text-xs">✕</span>
                    {exc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How we do it — Process steps */}
          <div>
            <div className="mb-8">
              <span className="text-fasty-yellow text-xs font-bold uppercase tracking-widest mb-2 block">How we do it</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Our step-by-step process</h2>
              <p className="text-gray-400">Exactly what to expect when our professional arrives.</p>
            </div>

            {service.process.length > 0 ? (
              <div className="space-y-8">
                {service.process.map((step, i) => (
                  <div
                    key={i}
                    className={`grid md:grid-cols-2 gap-6 items-center ${i % 2 === 1 ? 'md:[&>div:first-child]:order-2' : ''}`}
                  >
                    {/* Image */}
                    <div className="relative h-52 rounded-2xl overflow-hidden border border-white/10">
                      {step.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={step.imageUrl}
                          alt={step.title || `Step ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex flex-col items-center justify-center gap-3 border-dashed">
                          <span className="text-4xl opacity-20">📸</span>
                          <div className="text-center">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Photo coming soon</p>
                            <p className="text-xs text-gray-700 mt-1">Admin will add process images</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Text */}
                    <div>
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-fasty-yellow/15 border border-fasty-yellow/20 text-fasty-yellow font-extrabold text-lg mb-4">
                        {i + 1}
                      </span>
                      <h3 className="font-bold text-xl text-white mb-3">{step.title || `Step ${i + 1}`}</h3>
                      <p className="text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/3 border border-dashed border-white/10 rounded-2xl p-10 text-center">
                <span className="text-4xl mb-3 block opacity-20">🔧</span>
                <p className="font-semibold text-gray-500">Process details coming soon</p>
                <p className="text-sm text-gray-600 mt-1">Our team is preparing a visual walkthrough for this service.</p>
              </div>
            )}
          </div>

          {/* Gallery */}
          {service.gallery.length > 0 && (
            <div>
              <div className="mb-6">
                <span className="text-fasty-yellow text-xs font-bold uppercase tracking-widest mb-2 block">Gallery</span>
                <h2 className="text-2xl font-extrabold text-white">A look at our work</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {service.gallery.map((g) => (
                  <div key={g} className="relative h-36 rounded-xl overflow-hidden border border-white/8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {service.faqs.length > 0 && (
            <div>
              <div className="mb-6">
                <span className="text-fasty-yellow text-xs font-bold uppercase tracking-widest mb-2 block">FAQ</span>
                <h2 className="text-2xl font-extrabold text-white">Good to know</h2>
              </div>
              <div className="space-y-3">
                {service.faqs.map((f, i) => (
                  <details key={i} className="group bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-fasty-yellow/30 transition-colors cursor-pointer overflow-hidden">
                    <summary className="font-bold cursor-pointer list-none flex justify-between items-center gap-4 text-white outline-none">
                      <span className="text-sm leading-snug group-hover:text-fasty-yellow transition-colors">{f.q}</span>
                      <span className="text-fasty-yellow text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
                    </summary>
                    <p className="text-gray-400 mt-4 text-sm leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky booking sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-end pb-5 border-b border-white/8">
                <div>
                  <p className="text-sm text-gray-500">Starting at</p>
                  <p className="text-4xl font-extrabold text-white mt-1">₹{service.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-bold text-white">~{service.durationMin} min</p>
                </div>
              </div>

              <ul className="space-y-3 my-5">
                {(service.inclusions.length > 0 ? service.inclusions : [
                  'Verified professional',
                  'Genuine parts & materials',
                  'OTP-verified completion',
                  'Upfront pricing',
                ]).slice(0, 5).map((inc) => (
                  <li key={inc} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="text-fasty-yellow mt-0.5 text-xs">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={bookHref}
                className="w-full flex items-center justify-center gap-2 bg-fasty-yellow text-fasty-black font-extrabold py-4 rounded-xl hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-[0_4px_20px_rgba(255,196,0,0.25)]"
              >
                Book now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="text-xs text-center text-gray-600 mt-3">Free cancellation before assignment</p>
            </div>

            {/* Trust badges */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-4 space-y-3">
              {[
                { icon: '🛡️', text: 'Background-verified professional' },
                { icon: '🔐', text: 'OTP-secured start & finish' },
                { icon: '⚡', text: '15–20 min arrival guarantee' },
              ].map((b) => (
                <div key={b.icon} className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related services */}
      {related.length > 0 && (
        <section className="border-t border-white/5 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-fasty-yellow text-xs font-bold uppercase tracking-widest mb-2 block">You might also need</span>
              <h2 className="text-2xl font-extrabold text-white">Related services</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group flex items-center gap-4 bg-[#141414] border border-white/8 rounded-2xl p-4 hover:border-fasty-yellow/30 transition-all"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5">
                    <ServiceImage
                      src={r.imageUrl}
                      alt={r.name}
                      accentSlug={r.categories?.[0]}
                      rounded="rounded-xl"
                      className="w-16 h-16"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate text-sm group-hover:text-fasty-yellow transition-colors">{r.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">₹{r.price} · ~{r.durationMin} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
