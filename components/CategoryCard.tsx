import Link from 'next/link';
import { Category } from '@/lib/api';
import ServiceImage from '@/components/ServiceImage';

export default function CategoryCard({ category }: { category: Category }) {
  const services = category.services ?? [];
  const minPrice = services.length ? Math.min(...services.map((s) => s.price)) : null;

  return (
    <Link
      href={`/categories?cat=${category.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
    >
      {/* Portrait image — fills edge-to-edge, no side gaps */}
      <div className="relative aspect-[4/5] overflow-hidden bg-fasty-light">
        <ServiceImage
          src={category.imageUrl}
          alt={category.name}
          icon={category.icon || '🛠️'}
          accentSlug={category.slug}
          rounded="rounded-none"
          className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        {minPrice !== null && (
          <span className="absolute top-2.5 left-2.5 chip bg-fasty-yellow text-fasty-black text-[11px]">
            From ₹{minPrice}
          </span>
        )}
        <span className="absolute bottom-2.5 right-2.5 chip bg-white/90 text-fasty-black backdrop-blur text-[11px]">
          {services.length} services
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base leading-snug group-hover:text-fasty-black transition line-clamp-1">
          {category.name}
        </h3>
        <p className="text-xs text-fasty-gray line-clamp-2 leading-relaxed mt-1 min-h-[2.25rem]">
          {category.description || 'Trusted professionals, transparent pricing, fast arrival.'}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-fasty-gray">Verified pros</span>
          <span className="text-fasty-black text-sm font-bold group-hover:translate-x-0.5 transition-transform">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}
