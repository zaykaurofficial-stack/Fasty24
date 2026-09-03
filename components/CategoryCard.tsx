import Link from 'next/link';
import { Category } from '@/lib/api';
import { accentFor, SERVICE_ICONS } from '@/lib/content';
import FastImage from '@/components/FastImage';

export default function CategoryCard({
  category,
  priority = false,
}: {
  category: Category;
  priority?: boolean;
}) {
  const services = category.services ?? [];
  const minPrice = services.length ? Math.min(...services.map((s) => s.price)) : null;
  const icon = category.icon || SERVICE_ICONS[category.slug] || '🛠️';
  const hasImage = Boolean(category.imageUrl);

  return (
    <Link
      href={`/categories?cat=${category.slug}`}
      className="group flex flex-col h-full bg-[#141414] border border-white/8 rounded-3xl overflow-hidden hover:border-fasty-yellow/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(255,196,0,0.18)]"
    >
      {/* Media — full photo, resized to fit, never cropped */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#1a1a1a]">
        {hasImage ? (
          <FastImage
            src={category.imageUrl}
            alt={category.name}
            size="contain"
            fit="contain"
            priority={priority}
            className="absolute inset-0"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${accentFor(category.slug)}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                {icon}
              </span>
            </div>
          </div>
        )}

        {minPrice !== null && (
          <span className="absolute top-3 left-3 bg-fasty-yellow text-fasty-black text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_4px_14px_rgba(255,196,0,0.35)]">
            From ₹{minPrice}
          </span>
        )}
        <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center text-base">
          {icon}
        </span>
      </div>

      {/* Content — solid panel, never overlaps the photo */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-extrabold text-white tracking-tight group-hover:text-fasty-yellow transition-colors duration-300 line-clamp-1">
          {category.name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mt-1.5 mb-4">
          {category.description || 'Trusted professionals, transparent pricing, fast arrival.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/8">
          <span className="text-xs text-gray-500 font-medium">
            {services.length} {services.length === 1 ? 'service' : 'services'}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-fasty-yellow group-hover:translate-x-0.5 transition-transform">
            Explore <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
