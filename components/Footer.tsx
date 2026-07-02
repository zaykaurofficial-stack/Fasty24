'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCategories, Category } from '@/lib/api';
import { SITE } from '@/lib/content';
import Logo from '@/components/Logo';

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((c) => setCategories(c.slice(0, 5)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-fasty-black text-gray-400">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo href="/" size="sm" />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {SITE.tagline}. Verified professionals at your doorstep in 15-20 minutes.
            </p>
            <div className="flex gap-3">
              {['X', 'in', 'f', '▶'].map((s) => (
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
              {categories.length === 0 ? (
                <li>
                  <Link href="/categories" className="hover:text-fasty-yellow transition">
                    Browse all services
                  </Link>
                </li>
              ) : (
                categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/categories?cat=${c.slug}`} className="hover:text-fasty-yellow transition">
                      {c.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/categories" className="hover:text-fasty-yellow transition">All Services</Link></li>
              <li><Link href="/bookings" className="hover:text-fasty-yellow transition">My Bookings</Link></li>
              <li><Link href="/account" className="hover:text-fasty-yellow transition">My Account</Link></li>
              <li><Link href="/admin" className="hover:text-fasty-yellow transition">Admin</Link></li>
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

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>(c) 2026 Fasty-24. All rights reserved.</p>
          <p className="text-fasty-yellow font-semibold">15-20 min service guarantee</p>
        </div>
      </div>
    </footer>
  );
}
