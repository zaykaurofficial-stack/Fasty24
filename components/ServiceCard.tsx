'use client';

import Link from 'next/link';

interface ServiceCardProps {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  price?: number;
  durationMin?: number;
  categoryName?: string;
  inclusions?: string[];
}

export default function ServiceCard({
  id,
  slug,
  name,
  description,
  shortDescription,
  imageUrl,
  price,
  durationMin,
  categoryName = 'Service',
  inclusions = [],
}: ServiceCardProps) {
  const href = `/services/${slug || id}`;
  const displayDesc = shortDescription || description || 'Professional service by verified experts at your doorstep.';

  return (
    <Link href={href} className="group relative flex flex-col h-full bg-[#141414] border border-white/8 rounded-3xl overflow-hidden hover:border-fasty-yellow/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(255,196,0,0.15)] cursor-pointer">
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-[#1a1a1a]">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <span className="text-5xl opacity-40">🛠️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
        {price !== undefined && (
          <span className="absolute top-3 left-3 bg-fasty-yellow text-fasty-black text-xs font-extrabold px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,196,0,0.4)]">
            From ₹{price}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-fasty-yellow uppercase tracking-widest mb-1.5">{categoryName}</span>
        <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-fasty-yellow transition-colors duration-300">
          {name}
        </h3>
        <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">{displayDesc}</p>

        {inclusions.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {inclusions.slice(0, 2).map((inc, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-fasty-yellow shrink-0">✓</span>
                <span className="line-clamp-1">{inc}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
          {durationMin && (
            <span className="text-xs text-gray-500">~{durationMin} min</span>
          )}
          <span className="ml-auto text-xs font-bold text-fasty-yellow group-hover:translate-x-0.5 transition-transform">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
