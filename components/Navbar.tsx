'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, clearAuth } from '@/lib/api';
import { SITE } from '@/lib/content';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Services' },
    { href: '/bookings', label: 'My Bookings' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-fasty-black/95 backdrop-blur-md text-white border-b border-fasty-yellow/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="bg-fasty-yellow text-fasty-black font-extrabold text-xl px-3 py-1 rounded-lg">
            Fasty
          </span>
          <span className="font-bold text-fasty-yellow hidden sm:inline">24</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-semibold transition ${
                pathname === l.href
                  ? 'text-fasty-yellow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${SITE.phone.replace(/\s/g, '')}`}
            className="hidden lg:flex items-center gap-2 text-sm text-gray-400 hover:text-fasty-yellow transition"
          >
            <span>📞</span>
            <span>{SITE.phone}</span>
          </a>
          {user ? (
            <>
              <span className="text-xs text-gray-400 hidden sm:block max-w-[100px] truncate">
                {user.phone}
              </span>
              <button
                onClick={() => {
                  clearAuth();
                  setUser(null);
                  window.location.href = '/';
                }}
                className="text-sm font-semibold text-fasty-yellow hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-sm py-2 px-5">
              Login
            </Link>
          )}
          <button
            className="md:hidden text-fasty-yellow text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3 bg-fasty-black">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold py-2"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
