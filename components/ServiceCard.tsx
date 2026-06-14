import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  priceFrom: number;
  rating: number;
  bookings: string;
  tags: string[];
}

export default function ServiceCard({
  id,
  name,
  description,
  image,
  icon,
  priceFrom,
  rating,
  bookings,
  tags,
}: ServiceCardProps) {
  return (
    <Link
      href={`/categories?cat=${id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-fasty-yellow/50 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 bg-fasty-yellow text-fasty-black text-xs font-bold px-3 py-1 rounded-full">
          From ₹{priceFrom}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-white font-bold text-lg mt-1">{name}</h3>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-fasty-gray line-clamp-2 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-fasty-light text-fasty-black/80 px-2.5 py-0.5 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-fasty-yellow font-bold">★ {rating}</span>
            <span className="text-fasty-gray">· {bookings} bookings</span>
          </div>
          <span className="text-fasty-yellow font-bold group-hover:translate-x-1 transition-transform">
            Book →
          </span>
        </div>
      </div>
    </Link>
  );
}
