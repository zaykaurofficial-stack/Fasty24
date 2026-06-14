'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCategories, Category } from '@/lib/api';
import { CATEGORIES_RICH, SERVICE_IMAGES } from '@/lib/content';
import SectionHeader from '@/components/SectionHeader';

function getRichMeta(catId: string, catName: string) {
  return (
    CATEGORIES_RICH.find((c) => c.id === catId) ??
    CATEGORIES_RICH.find((c) => c.name === catName)
  );
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const selectedCat = searchParams.get('cat');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat
    ? categories.filter((c) => c._id === selectedCat)
    : categories;

  const heroCat = selectedCat ? getRichMeta(selectedCat, '') : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-fasty-gray font-semibold">Loading services...</div>
      </div>
    );
  }

  return (
    <>
      {/* Page hero */}
      <section className="relative bg-fasty-black text-white py-16 overflow-hidden">
        {heroCat ? (
          <>
            <Image
              src={heroCat.image}
              alt={heroCat.name}
              fill
              className="object-cover opacity-30"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-fasty-black to-fasty-black/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-fasty-black to-gray-900" />
        )}
        <div className="relative max-w-7xl mx-auto px-4">
          <Link href="/" className="text-sm text-fasty-yellow hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {heroCat ? (
              <>
                {heroCat.icon} {heroCat.name}
              </>
            ) : (
              'All Home Services'
            )}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            {heroCat?.description ??
              'Browse our full catalog — transparent pricing, verified staff, 15–20 min arrival.'}
          </p>
          {heroCat && (
            <div className="flex flex-wrap gap-4 mt-6 text-sm">
              <span className="bg-fasty-yellow text-fasty-black font-bold px-4 py-1.5 rounded-full">
                From ₹{heroCat.priceFrom}
              </span>
              <span className="glass-dark px-4 py-1.5 rounded-full">★ {heroCat.rating} rating</span>
              <span className="glass-dark px-4 py-1.5 rounded-full">{heroCat.bookings} bookings</span>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!selectedCat && (
          <>
            <SectionHeader
              eyebrow="Categories"
              title="What do you need today?"
              subtitle="Tap a category to see services and book instantly."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {categories.map((c) => {
                const rich = getRichMeta(c._id, c.name);
                const img = rich?.image ?? SERVICE_IMAGES[c._id] ?? SERVICE_IMAGES['1'];
                return (
                  <Link
                    key={c._id}
                    href={`/categories?cat=${c._id}`}
                    className="relative h-32 rounded-2xl overflow-hidden group border border-gray-100"
                  >
                    <Image
                      src={img}
                      alt={c.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 flex items-center px-5 gap-3">
                      <span className="text-3xl">{c.icon ?? rich?.icon}</span>
                      <div>
                        <p className="text-white font-bold">{c.name}</p>
                        <p className="text-fasty-yellow text-xs font-semibold">
                          From ₹{rich?.priceFrom ?? 499}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <div className="space-y-12">
          {filtered.map((cat) => {
            const rich = getRichMeta(cat._id, cat.name);
            return (
              <div key={cat._id}>
                {!selectedCat && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={rich?.image ?? SERVICE_IMAGES['1']}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold">{cat.name}</h2>
                      <p className="text-fasty-gray text-sm">{cat.description}</p>
                    </div>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(cat.services ?? []).map((svc) => (
                    <Link
                      key={svc._id}
                      href={`/book/${svc._id}?name=${encodeURIComponent(svc.name)}&cat=${encodeURIComponent(cat.name)}&img=${encodeURIComponent(rich?.image ?? '')}`}
                      className="card group hover:border-fasty-yellow overflow-hidden !p-0"
                    >
                      <div className="relative h-36 bg-fasty-light">
                        <Image
                          src={rich?.image ?? SERVICE_IMAGES['1']}
                          alt={svc.name}
                          fill
                          className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                          sizes="300px"
                        />
                        <div className="absolute top-3 right-3 bg-fasty-yellow text-fasty-black text-xs font-bold px-2.5 py-1 rounded-full">
                          ~{svc.estimatedDurationMinutes ?? 60} min
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg group-hover:text-fasty-yellow transition">
                          {svc.name}
                        </h3>
                        <p className="text-sm text-fasty-gray mt-1">
                          Includes inspection · Genuine parts · Warranty
                        </p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <span className="font-extrabold text-xl">
                            ₹{rich?.priceFrom ?? 499}
                          </span>
                          <span className="bg-fasty-black text-fasty-yellow font-bold w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-fasty-yellow group-hover:text-fasty-black transition">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center animate-pulse">Loading...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
