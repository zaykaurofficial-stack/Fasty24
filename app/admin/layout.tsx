'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAdminToken, clearAdminToken } from '@/lib/api';
import Logo from '@/components/Logo';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/services', label: 'Services', icon: '🛠️' },
  { href: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📦' },
  { href: '/admin/experts', label: 'Experts', icon: '🧑‍🔧' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!getAdminToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [isLogin, pathname, router]);

  if (isLogin) return <div className="min-h-screen bg-fasty-light">{children}</div>;
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-fasty-gray">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-fasty-light">
      <aside className="w-60 shrink-0 bg-fasty-black text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Logo href="/admin" size="sm" suffix="Admin" />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active ? 'bg-fasty-yellow text-fasty-black' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5">
            <span>↗</span> View site
          </Link>
          <button
            onClick={() => {
              clearAdminToken();
              router.replace('/admin/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5"
          >
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
