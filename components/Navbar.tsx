'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, clearAuth, Principal } from '@/lib/api';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<Principal | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  function handleLogout() {
    clearAuth();
    setUser(null);
    router.push('/');
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/categories' },
    ...(user ? [{ name: 'My Bookings', href: '/bookings' }] : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-fasty-black/90 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="bg-fasty-yellow text-fasty-black font-extrabold text-lg px-4 py-1.5 rounded-lg shadow-sm group-hover:shadow-[0_0_15px_rgba(255,196,0,0.4)] transition-shadow">
                Fasty
              </span>
              <span className="font-extrabold text-fasty-yellow text-lg tracking-tight">24</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative text-sm font-semibold transition-colors duration-300 ${
                      isActive ? 'text-fasty-yellow' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-fasty-yellow rounded-full shadow-[0_0_8px_rgba(255,196,0,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-fasty-yellow transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-fasty-yellow/20 border border-fasty-yellow/30 flex items-center justify-center text-fasty-yellow text-xs font-bold">
                      {(user.name || user.phone || 'U')[0].toUpperCase()}
                    </span>
                    <span className="max-w-[120px] truncate">{user.name || user.phone}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-white text-sm font-bold hover:text-fasty-yellow transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/categories"
                    className="bg-fasty-yellow text-fasty-black px-5 py-2.5 rounded-xl text-sm font-extrabold hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,196,0,0.35)] transition-all duration-300"
                  >
                    Book Now
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-fasty-black/97 backdrop-blur-xl z-40 transition-all duration-500 ease-in-out md:hidden flex flex-col pt-24 px-6 ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="flex flex-col gap-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-4 border-b border-white/8 text-lg font-bold transition-colors ${
                pathname === link.href ? 'text-fasty-yellow' : 'text-white hover:text-fasty-yellow'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-4 border-b border-white/8 text-lg font-bold text-white hover:text-fasty-yellow transition-colors"
              >
                My Account
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="py-4 border-b border-white/8 text-lg font-bold text-red-400 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-4 border-b border-white/8 text-lg font-bold text-white hover:text-fasty-yellow transition-colors"
            >
              Log in
            </Link>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-center w-full bg-fasty-yellow text-fasty-black px-6 py-4 rounded-xl font-extrabold shadow-[0_4px_20px_rgba(255,196,0,0.3)] hover:bg-yellow-400 transition-all"
          >
            Book a Service Now
          </Link>
        </div>
      </div>
    </>
  );
}
