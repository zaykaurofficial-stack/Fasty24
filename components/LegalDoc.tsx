import type { ReactNode } from 'react';
import Link from 'next/link';
import { SITE } from '@/lib/content';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold text-white mb-4">{title}</h2>
      <div className="space-y-3 text-gray-300 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export function LegalContactCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-2 space-y-2">
      <p><strong className="text-white">Fasty-24</strong></p>
      <p>
        Email:{' '}
        <a href={`mailto:${SITE.email}`} className="text-fasty-yellow hover:underline">
          {SITE.email}
        </a>
      </p>
      <p>
        Phone:{' '}
        <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="text-fasty-yellow hover:underline">
          {SITE.phone}
        </a>
      </p>
      <p className="text-gray-400">Operating in: {SITE.cities.join(', ')}</p>
    </div>
  );
}

export default function LegalDoc({
  title,
  updated,
  intro,
  backHref = '/',
  backLabel = '← Back to home',
  children,
  footerLinks,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  footerLinks?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-fasty-black text-white">
      <section className="relative pt-28 pb-12 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fasty-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <Link
            href={backHref}
            className="text-gray-500 hover:text-fasty-yellow text-sm transition-colors mb-6 inline-flex items-center gap-1.5"
          >
            {backLabel}
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{title}</h1>
          <p className="text-gray-400">Last updated: {updated}</p>
          <div className="text-gray-400 mt-4 text-base leading-relaxed">{intro}</div>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {children}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
          {footerLinks ?? (
            <Link href="/" className="text-sm font-bold text-fasty-yellow hover:underline">
              ← Back to home
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
