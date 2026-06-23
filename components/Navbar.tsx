'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Detect scroll to add glass effect and border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'My Bookings', href: '/bookings' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-fasty-black/80 backdrop-blur-lg border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
           {/* Logo Section - Updated to match image_3628f7.png */}
<Link href="/" className="flex items-center gap-2 group">
  <span className="bg-fasty-yellow text-fasty-black font-bold text-lg px-4 py-1.5 rounded-lg shadow-sm">
    Fasty
  </span>
  <span className="font-bold text-fasty-yellow text-lg tracking-tight">24</span>
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
                    {/* Active Link Indicator */}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-fasty-yellow rounded-full shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Login/CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-white text-sm font-bold hover:text-fasty-yellow transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/categories"
                className="bg-white/10 hover:bg-fasty-yellow text-white hover:text-fasty-black border border-white/10 hover:border-fasty-yellow backdrop-blur-md px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 focus:outline-none"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-fasty-black/95 backdrop-blur-xl z-40 transition-transform duration-500 ease-in-out md:hidden flex flex-col pt-24 px-6 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 text-xl font-bold">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`pb-4 border-b border-white/10 ${
                pathname === link.href ? 'text-fasty-yellow' : 'text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="pb-4 border-b border-white/10 text-white"
          >
            Log in
          </Link>
        </div>
        
        <div className="mt-8">
          <Link
            href="/categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-center w-full bg-fasty-yellow text-fasty-black px-6 py-4 rounded-xl font-extrabold shadow-[0_4px_20px_rgba(255,215,0,0.3)]"
          >
            Book a Service Now
          </Link>
        </div>
      </div>
    </>
  );
}