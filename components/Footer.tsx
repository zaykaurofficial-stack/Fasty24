import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES_RICH, SITE } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="bg-fasty-black text-gray-400">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-fasty-yellow text-fasty-black font-extrabold text-lg px-2.5 py-1 rounded-lg">
                Fasty
              </span>
              <span className="font-bold text-fasty-yellow text-lg">24</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {SITE.tagline}. Verified professionals at your doorstep in 15–20 minutes.
            </p>
            <div className="flex gap-3">
              {['𝕏', 'in', 'f', '▶'].map((s) => (
                <span
                  key={s}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-sm hover:bg-fasty-yellow hover:text-fasty-black transition cursor-pointer"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Popular Services</h4>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES_RICH.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/categories?cat=${c.id}`} className="hover:text-fasty-yellow transition">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/categories" className="hover:text-fasty-yellow transition">All Services</Link></li>
              <li><Link href="/login" className="hover:text-fasty-yellow transition">Become a Partner</Link></li>
              <li><span className="cursor-default">Careers</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-fasty-yellow font-semibold">Phone</span>
                <br />
                {SITE.phone}
              </li>
              <li>
                <span className="text-fasty-yellow font-semibold">Email</span>
                <br />
                {SITE.email}
              </li>
              <li>
                <span className="text-fasty-yellow font-semibold">Cities</span>
                <br />
                {SITE.cities.join(' · ')}
              </li>
            </ul>
          </div>
        </div>

        <div className="relative h-32 rounded-2xl overflow-hidden mb-8 opacity-60">
          <Image
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80"
            alt="Team"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-fasty-black/60 flex items-center justify-center">
            <p className="text-white font-bold text-center px-4">
              500+ verified professionals · Background checked · OTP-secured jobs
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 Fasty-24. All rights reserved.</p>
          <p className="text-fasty-yellow font-semibold">⚡ 15–20 min service guarantee</p>
        </div>
      </div>
    </footer>
  );
}
