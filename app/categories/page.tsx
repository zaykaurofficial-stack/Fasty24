'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCategories, Category, errorMessage } from '@/lib/api';
import { accentFor } from '@/lib/content';
import ServiceCard from '@/components/ServiceCard';
import ServiceImage from '@/components/ServiceImage';
import SectionHeader from '@/components/SectionHeader';
import { toast } from '@/lib/toast';

function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="skeleton h-10 w-64 mb-8" />
      <div className="flex gap-3 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-28" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-64" />
        ))}
      </div>
    </div>
  );
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const selectedCat = searchParams.get('cat');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === selectedCat) ?? null,
    [categories, selectedCat],
  );

  const visibleCategories = useMemo(() => {
    let list = selectedCat ? categories.filter((c) => c.slug === selectedCat) : categories;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list
        .map((c) => ({
          ...c,
          services: (c.services ?? []).filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.shortDescription?.toLowerCase().includes(q) ||
              c.name.toLowerCase().includes(q),
          ),
        }))
        .filter((c) => (c.services ?? []).length > 0);
    }
    return list;
  }, [categories, selectedCat, query]);

  if (loading) return <CatalogSkeleton />;

  return (
    <>
      {/* Page hero */}
      <section className="relative bg-fasty-black text-white py-16 overflow-hidden">
        {activeCategory?.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeCategory.imageUrl} alt={activeCategory.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${activeCategory ? accentFor(activeCategory.slug) : 'from-fasty-black to-gray-900'} opacity-30`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-fasty-black to-fasty-black/70" />
        <div className="relative max-w-7xl mx-auto px-4">
          <Link href="/" className="text-sm text-fasty-yellow hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {activeCategory ? activeCategory.name : 'All Home Services'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            {activeCategory?.description ??
              'Browse our full catalog - transparent pricing, verified staff, 15-20 min arrival.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters + search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            <Link
              href="/categories"
              className={`chip border whitespace-nowrap ${
                !selectedCat
                  ? 'bg-fasty-black text-white border-fasty-black'
                  : 'bg-white text-fasty-black border-gray-200 hover:border-fasty-black'
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories?cat=${c.slug}`}
                className={`chip border whitespace-nowrap ${
                  selectedCat === c.slug
                    ? 'bg-fasty-black text-white border-fasty-black'
                    : 'bg-white text-fasty-black border-gray-200 hover:border-fasty-black'
                }`}
              >
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="input-field md:max-w-xs !py-2.5"
          />
        </div>

        {visibleCategories.length === 0 ? (
          <div className="card-flat text-center py-16 text-fasty-gray">
            <p className="font-semibold">No services found.</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {visibleCategories.map((cat) => (
              <div key={cat.id}>
                {!selectedCat && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden">
                      <ServiceImage
                        src={cat.imageUrl}
                        alt={cat.name}
                        icon={cat.icon || '🛠️'}
                        accentSlug={cat.slug}
                        rounded="rounded-xl"
                        className="w-14 h-14"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold">{cat.name}</h2>
                      <p className="text-fasty-gray text-sm">{cat.description}</p>
                    </div>
                  </div>
                )}
                {(cat.services ?? []).length === 0 ? (
                  <p className="text-fasty-gray text-sm">No services in this category yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(cat.services ?? []).map((svc) => (
                      <ServiceCard key={svc.id} service={svc} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}
