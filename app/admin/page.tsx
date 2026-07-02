'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  adminGetServices,
  adminGetCategories,
  adminGetBookings,
  adminGetExperts,
  Booking,
  STATUS_LABELS,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ services: 0, categories: 0, bookings: 0, experts: 0, revenue: 0 });
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminGetServices(), adminGetCategories(), adminGetBookings(), adminGetExperts()])
      .then(([services, categories, bookings, experts]) => {
        const revenue = bookings
          .filter((b) => b.payment?.status === 'paid')
          .reduce((sum, b) => sum + (b.pricing?.total ?? 0), 0);
        setStats({
          services: services.length,
          categories: categories.length,
          bookings: bookings.length,
          experts: experts.length,
          revenue,
        });
        setRecent(bookings.slice(0, 8));
      })
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Services', value: stats.services, href: '/admin/services', icon: '🛠️' },
    { label: 'Categories', value: stats.categories, href: '/admin/categories', icon: '🗂️' },
    { label: 'Bookings', value: stats.bookings, href: '/admin/bookings', icon: '📦' },
    { label: 'Experts', value: stats.experts, href: '/admin/experts', icon: '🧑‍🔧' },
    { label: 'Revenue', value: `₹${stats.revenue}`, href: '/admin/bookings', icon: '💰' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Dashboard</h1>
      <p className="text-fasty-gray mb-8">Overview of your Fasty-24 operations</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card hover:-translate-y-0.5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-2xl font-extrabold">{loading ? '—' : c.value}</div>
            <div className="text-sm text-fasty-gray">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold">Recent bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-bold text-fasty-yellow hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-10" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="p-8 text-center text-fasty-gray">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-fasty-light text-fasty-gray text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => {
                const status = STATUS_LABELS[b.status] ?? { label: b.status, color: 'bg-gray-100' };
                return (
                  <tr key={b.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 font-semibold">{b.items.map((i) => i.name).join(', ')}</td>
                    <td className="px-5 py-3 text-fasty-gray">{b.customer?.name || b.customer?.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`chip ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold">₹{b.pricing?.total ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
