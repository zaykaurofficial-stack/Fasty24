'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getService, getServices, Service, errorMessage, ApiError } from '@/lib/api';
import ServiceImage from '@/components/ServiceImage';
import SectionHeader from '@/components/SectionHeader';

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="skeleton h-72 w-full mb-8" />
      <div className="skeleton h-8 w-2/3 mb-4" />
      <div className="skeleton h-4 w-full mb-2" />
      <div className="skeleton h-4 w-5/6 mb-2" />
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
      </div>
    </div>
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
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-extrabold mb-2">Service not found</h1>
        <p className="text-fasty-gray mb-6">This service may have been removed or renamed.</p>
        <Link href="/categories" className="btn-primary">
          Browse all services
        </Link>
      </div>
    );
  }

  const accent = service.categories?.[0];
  const thumbs = [service.imageUrl, ...(service.gallery || [])].filter(Boolean) as string[];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-fasty-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Link href="/categories" className="text-sm text-fasty-yellow hover:underline mb-4 inline-block">
              ← Back to services
            </Link>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">{service.name}</h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {service.shortDescription || service.description || 'Premium home service by verified professionals.'}
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="chip bg-fasty-yellow text-fasty-black text-sm">₹{service.price}</span>
              <span className="chip glass-dark text-white text-sm">~{service.durationMin} min</span>
              <span className="chip glass-dark text-white text-sm">OTP-secured</span>
              <span className="chip glass-dark text-white text-sm">15-20 min arrival</span>
            </div>
            <Link href={`/book/${service.slug}`} className="btn-primary text-base">
              Book this service
            </Link>
          </div>

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
                    className={`relative h-16 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition ${
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
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-14">
          {/* Description */}
          <div>
            <SectionHeader eyebrow="Overview" title="About this service" />
            <p className="text-fasty-black/80 leading-relaxed whitespace-pre-line">
              {service.description ||
                'Our trained professionals deliver this service with genuine parts, transparent pricing, and a satisfaction guarantee. Book in seconds and track your professional live.'}
            </p>
          </div>

          {/* How we do it */}
          {service.process.length > 0 ? (
            <div>
              <SectionHeader
                eyebrow="How we do it"
                title="Our step-by-step process"
                subtitle="Exactly what to expect when our professional arrives."
              />
              <div className="space-y-8">
                {service.process.map((step, i) => (
                  <div
                    key={i}
                    className={`grid md:grid-cols-2 gap-6 items-center ${
                      i % 2 === 1 ? 'md:[&>div:first-child]:order-2' : ''
                    }`}
                  >
                    <div className="relative h-52 rounded-2xl overflow-hidden border border-gray-100 shadow-soft">
                      <ServiceImage
                        src={step.imageUrl || undefined}
                        alt={step.title || `Step ${i + 1}`}
                        icon="📸"
                        accentSlug={accent}
                        rounded="rounded-2xl"
                        fit="contain"
                        className="w-full h-full"
                        showPlaceholderLabel
                      />
                    </div>
                    <div>
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-fasty-black text-fasty-yellow font-extrabold mb-3">
                        {i + 1}
                      </span>
                      <h3 className="font-bold text-xl mb-2">{step.title || `Step ${i + 1}`}</h3>
                      <p className="text-fasty-gray leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <SectionHeader eyebrow="How we do it" title="Our step-by-step process" />
              <div className="card-flat border-dashed text-center py-12 text-fasty-gray">
                <p className="font-semibold">Process photos coming soon.</p>
                <p className="text-sm mt-1">
                  Our team is adding a visual walkthrough of how this service is performed.
                </p>
              </div>
            </div>
          )}

          {/* Gallery */}
          {service.gallery.length > 0 && (
            <div>
              <SectionHeader eyebrow="Gallery" title="A look at our work" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {service.gallery.map((g) => (
                  <div key={g} className="relative h-36 rounded-xl overflow-hidden border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {service.faqs.length > 0 && (
            <div>
              <SectionHeader eyebrow="FAQ" title="Good to know" />
              <div className="space-y-3">
                {service.faqs.map((f, i) => (
                  <details key={i} className="card-flat group open:border-fasty-yellow/40">
                    <summary className="font-bold cursor-pointer list-none flex justify-between items-center gap-4">
                      {f.q}
                      <span className="text-fasty-yellow text-xl group-open:rotate-45 transition-transform">
                        +
                      </span>
                    </summary>
                    <p className="text-fasty-gray mt-3 text-sm leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky booking sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="card !p-6">
              <div className="flex justify-between items-end pb-5 border-b border-gray-100">
                <div>
                  <p className="text-sm text-fasty-gray">Starting at</p>
                  <p className="text-4xl font-extrabold">₹{service.price}</p>
                </div>
                <span className="text-right text-sm">
                  <span className="block text-fasty-gray">Duration</span>
                  <span className="font-bold">~{service.durationMin} min</span>
                </span>
              </div>
              {service.inclusions.length > 0 ? (
                <ul className="space-y-2.5 my-5">
                  {service.inclusions.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-sm">
                      <span className="text-fasty-yellow mt-0.5">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2.5 my-5">
                  {['Verified professional', 'Genuine parts & materials', 'OTP-verified completion', 'Upfront pricing'].map(
                    (inc) => (
                      <li key={inc} className="flex items-start gap-2 text-sm">
                        <span className="text-fasty-yellow mt-0.5">✓</span>
                        <span>{inc}</span>
                      </li>
                    ),
                  )}
                </ul>
              )}
              <Link href={`/book/${service.slug}`} className="btn-primary w-full">
                Book now
              </Link>
              <p className="text-xs text-center text-fasty-gray mt-3">Free cancellation before assignment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-fasty-light py-14">
          <div className="max-w-6xl mx-auto px-4">
            <SectionHeader eyebrow="You might also need" title="Related services" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="card group flex items-center gap-4 !py-4"
                >
                  <div className="w-16 h-16 shrink-0">
                    <ServiceImage
                      src={r.imageUrl}
                      alt={r.name}
                      accentSlug={r.categories?.[0]}
                      rounded="rounded-xl"
                      className="w-16 h-16"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate group-hover:text-fasty-black">{r.name}</h3>
                    <p className="text-sm text-fasty-gray">₹{r.price} · ~{r.durationMin} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
