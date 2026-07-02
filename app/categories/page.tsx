'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCategories, Category } from '@/lib/api';
import { SERVICE_IMAGES } from '@/lib/content';
import ServiceCard from '@/components/ServiceCard';

function CategoriesContent() {
  const searchParams = useSearchParams();
  const selectedCat = searchParams.get('cat');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat ? categories.filter((c) => c._id === selectedCat) : categories;

  if (loading) {
    return <div className="min-h-screen bg-fasty-black flex items-center justify-center text-yellow-500">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-fasty-black pb-24">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {filtered.map((cat) => (
          <div key={cat._id} className="mb-20">
            <h2 className="text-3xl font-extrabold text-white mb-8">{cat.name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(cat.services ?? []).map((svc: any) => (
                <Link 
                  key={svc.id} 
                  href={`/book/${svc.id}?name=${encodeURIComponent(svc.name)}&cat=${encodeURIComponent(cat.name)}&price=${svc.options?.[0]?.price || 499}&img=${encodeURIComponent(SERVICE_IMAGES[cat._id] || SERVICE_IMAGES['1'])}`}
                  className="block h-full"
                >
                  <ServiceCard
                    id={svc.id}
                    name={svc.name}
                    description={svc.description}
                    image={SERVICE_IMAGES[cat._id] || SERVICE_IMAGES['1']}
                    categoryName={cat.name}
                    options={svc.options}
                    included={svc.included}
                    excluded={svc.excluded}
                    partsUsed={svc.partsUsed}
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-fasty-black" />}>
      <CategoriesContent />
    </Suspense>
  );
}