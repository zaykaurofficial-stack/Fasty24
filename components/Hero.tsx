'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser } from '@/lib/api';
import type { SiteContent } from '@/lib/api';
import { HERO_DEFAULT } from '@/lib/content';

type HeroProps = {
  content?: SiteContent['hero'] | null;
};

export default function Hero({ content }: HeroProps) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(!!getUser());
  }, []);

  const pill = content?.pill || HERO_DEFAULT.pill;
  const titleLine1 = content?.titleLine1 || HERO_DEFAULT.titleLine1;
  const titleLine2 = content?.titleLine2 || HERO_DEFAULT.titleLine2;
  const titleHighlight = content?.titleHighlight || HERO_DEFAULT.titleHighlight;
  const subtitle = content?.subtitle || HERO_DEFAULT.subtitle;
  const socialProofRating = content?.socialProofRating || HERO_DEFAULT.socialProofRating;
  const socialProofText = content?.socialProofText || HERO_DEFAULT.socialProofText;
  const cards = content?.cards?.length ? content.cards : HERO_DEFAULT.cards;

  return (
    <section className="relative w-full pt-24 pb-32 overflow-hidden bg-fasty-black">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fasty-yellow/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm shadow-lg">
              <span className="w-2 h-2 rounded-full bg-fasty-yellow animate-pulse" />
              <span className="text-xs font-medium text-gray-300">{pill}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              {titleLine1} <br />
              {titleLine2} <br />
              <span className="text-fasty-yellow drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">{titleHighlight}</span>
            </h1>

            <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">{subtitle}</p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/categories"
                className="bg-fasty-yellow text-fasty-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all duration-300 shadow-[0_4px_20px_rgba(255,215,0,0.25)] hover:shadow-[0_4px_30px_rgba(255,215,0,0.4)] hover:-translate-y-1"
              >
                Explore Services
              </Link>
              {signedIn ? (
                <Link
                  href="/account"
                  className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                >
                  My Account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                >
                  Sign in / Register
                </Link>
              )}
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="" className="w-10 h-10 rounded-full border-2 border-fasty-black object-cover" />
                <img src="https://i.pravatar.cc/100?img=2" alt="" className="w-10 h-10 rounded-full border-2 border-fasty-black object-cover" />
                <img src="https://i.pravatar.cc/100?img=3" alt="" className="w-10 h-10 rounded-full border-2 border-fasty-black object-cover" />
              </div>
              <div className="text-sm">
                <span className="text-white font-bold text-base tracking-wide">{socialProofRating}</span>
                <span className="text-gray-400"> {socialProofText}</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-fasty-yellow/20 to-transparent rounded-3xl blur-3xl transform rotate-6" />
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {cards.slice(0, 4).map((card, i) => (
                  <div
                    key={`${card.title}-${i}`}
                    className={`bg-fasty-black/80 rounded-2xl p-5 border border-white/5 hover:border-fasty-yellow/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg ${
                      i % 2 === 1 ? 'translate-y-6' : ''
                    }`}
                  >
                    <div className="text-3xl mb-3">{card.icon}</div>
                    <div className="text-white font-bold">{card.title}</div>
                    <div className="text-fasty-yellow text-sm font-medium mt-1">{card.priceLabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
