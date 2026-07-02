import Link from 'next/link';
import { Service } from '@/lib/api';
import ServiceImage from '@/components/ServiceImage';

export default function ServiceCard({ service }: { service: Service }) {
  const accent = service.categories?.[0];
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-lift hover:border-fasty-yellow/50 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-fasty-light">
        <ServiceImage
          src={service.imageUrl}
          alt={service.name}
          accentSlug={accent}
          rounded="rounded-none"
          className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 chip bg-fasty-yellow text-fasty-black">
          ~{service.durationMin} min
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg group-hover:text-fasty-black transition line-clamp-1">
          {service.name}
        </h3>
        <p className="text-sm text-fasty-gray line-clamp-2 leading-relaxed mt-1 min-h-[2.5rem]">
          {service.shortDescription || service.description || 'Professional service at your doorstep.'}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="font-extrabold text-xl">₹{service.price}</span>
          <span className="bg-fasty-black text-fasty-yellow font-bold px-4 h-10 rounded-xl flex items-center justify-center group-hover:bg-fasty-yellow group-hover:text-fasty-black transition text-sm">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
