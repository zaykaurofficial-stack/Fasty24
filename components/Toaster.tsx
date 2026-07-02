'use client';

import { useEffect, useState } from 'react';
import type { ToastDetail } from '@/lib/toast';

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastDetail[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      setToasts((prev) => [...prev, detail]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, 4000);
    }
    window.addEventListener('fasty:toast', onToast);
    return () => window.removeEventListener('fasty:toast', onToast);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lift text-sm font-semibold max-w-xs ${
            t.type === 'success'
              ? 'bg-fasty-black text-fasty-yellow'
              : t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-white text-fasty-black border border-gray-100'
          }`}
        >
          <span className="text-base">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'ℹ'}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
