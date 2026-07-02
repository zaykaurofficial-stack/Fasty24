'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCategories, Category, Service, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import { SERVICE_ICONS } from '@/lib/content';

function ServiceListCard({ service, categoryName }: { service: Service; categoryName: string }) {
  const href = `/services/${service.slug || service.id}`;
  return (
    <Link
      href={href}
      className="group flex flex-col bg-[#141414] border border-white/8 rounded-2xl overflow-hidden hover:border-fasty-yellow/40 transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(255,196,0,0.15)]"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-[#1c1c1c]">
        {service.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-25 group-hover:opacity-40 transition-opacity">🛠️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
        <span className="absolute top-3 left-3 bg-fasty-yellow text-fasty-black text-xs font-extrabold px-3 py-1 rounded-full">
          ₹{service.price}
        </span>
        {service.durationMin > 0 && (
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
            ~{service.durationMin} min
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-fasty-yellow uppercase tracking-widest mb-1">{categoryName}</span>
        <h3 className="font-bold text-white text-sm leading-snug mb-2 group-hover:text-fasty-yellow transition-colors">
          {service.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {service.shortDescription || service.description || 'Trusted professionals at your doorstep.'}
        </p>

        {service.inclusions?.length > 0 && (
          <ul className="space-y-1 mb-3">
            {service.inclusions.slice(0, 2).map((inc, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="text-fasty-yellow text-[10px]">✓</span>
                <span className="line-clamp-1">{inc}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-xs text-gray-600">OTP-secured</span>
          <span className="text-xs font-bold text-fasty-yellow group-hover:translate-x-0.5 transition-transform">Book →</span>
        </div>
      </div>
    </Link>
  );
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedSlug = searchParams.get('cat');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedSlug
    ? categories.filter((c) => c.slug === selectedSlug || c.id === selectedSlug)
    : categories;

  const activeCat = selectedSlug
    ? categories.find((c) => c.slug === selectedSlug || c.id === selectedSlug)
    : null;

  return (
    <main className="min-h-screen bg-fasty-black pb-24">
      {/* Page header */}
      <section className="relative pt-24 pb-16 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fasty-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-fasty-yellow transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Services</span>
            {activeCat && (
              <>
                <span>/</span>
                <span className="text-fasty-yellow">{activeCat.name}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            {activeCat ? activeCat.name : 'All Services'}
          </h1>
          <p className="text-gray-400 text-lg">
            {activeCat?.description || 'Verified professionals, transparent pricing, 15–20 min arrival.'}
          </p>

          {/* Category filter pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              <button
                onClick={() => router.push('/categories')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  !selectedSlug
                    ? 'bg-fasty-yellow text-fasty-black shadow-[0_0_12px_rgba(255,196,0,0.35)]'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:border-fasty-yellow/40 hover:text-white'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/categories?cat=${cat.slug}`)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedSlug === cat.slug
                      ? 'bg-fasty-yellow text-fasty-black shadow-[0_0_12px_rgba(255,196,0,0.35)]'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-fasty-yellow/40 hover:text-white'
                  }`}
                >
                  {SERVICE_ICONS[cat.slug] || ''} {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {filtered.map((cat) => {
            const services = cat.services ?? [];
            if (!services.length && !loading) return null;
            return (
              <div key={cat.id}>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-fasty-yellow text-xs font-bold uppercase tracking-widest mb-2 block">
                      {SERVICE_ICONS[cat.slug] || ''} {cat.name}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white">{cat.name}</h2>
                    {cat.description && (
                      <p className="text-gray-400 text-sm mt-1">{cat.description}</p>
                    )}
                  </div>
                  {services.length > 0 && (
                    <span className="text-gray-500 text-xs font-medium shrink-0">{services.length} services</span>
                  )}
                </div>

                {services.length === 0 ? (
                  <div className="bg-white/3 border border-dashed border-white/10 rounded-2xl p-10 text-center">
                    <span className="text-4xl mb-3 block opacity-30">🛠️</span>
                    <p className="text-gray-500 text-sm">Services coming soon in this category.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {services.map((svc) => (
                      <ServiceListCard key={svc.id} service={svc} categoryName={cat.name} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-gray-400 text-lg mb-4">No services found.</p>
              <Link href="/categories" className="text-fasty-yellow font-bold hover:underline">
                View all categories →
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-fasty-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fasty-yellow/20 border-t-fasty-yellow rounded-full animate-spin" />
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
