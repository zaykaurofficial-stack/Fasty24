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
      className="group relative block aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-[#141414] hover:border-fasty-yellow/45 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-18px_rgba(255,196,0,0.22)]"
    >
      {/* Full-bleed media */}
      {hasImage ? (
        <FastImage
          src={category.imageUrl}
          alt={category.name}
          size="card"
          priority={priority}
          className="absolute inset-0"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-[#161616]">
          <div className={`absolute inset-0 bg-gradient-to-br ${accentFor(category.slug)}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[5.5rem] leading-none opacity-25 blur-[2px] scale-150 select-none pointer-events-none">
              {icon}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pb-16">
            <span className="text-7xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-110">
              {icon}
            </span>
          </div>
        </div>
      )}

      {/* Atmosphere overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-br from-fasty-yellow/0 via-transparent to-fasty-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Price */}
      {minPrice !== null && (
        <span className="absolute top-3.5 left-3.5 z-10 bg-fasty-yellow text-fasty-black text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_6px_18px_rgba(255,196,0,0.35)]">
          From ₹{minPrice}
        </span>
      )}

      {/* Content sits on the image */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col gap-2">
        <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-fasty-yellow transition-colors duration-300 line-clamp-1">
          {category.name}
        </h3>
        <p className="text-sm text-white/70 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {category.description || 'Trusted professionals, transparent pricing, fast arrival.'}
        </p>
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/15">
          <span className="text-xs text-white/55 font-medium">
            {services.length} {services.length === 1 ? 'service' : 'services'}
          </span>
          <span className="text-sm font-bold text-fasty-yellow group-hover:translate-x-0.5 transition-transform">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}
