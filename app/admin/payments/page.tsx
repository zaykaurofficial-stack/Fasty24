'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPayment, adminGetPayments, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  created: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-800',
};

const KINDS = ['all', 'booking', 'estimate'] as const;

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all');

  const load = useCallback(() => {
    setLoading(true);
    adminGetPayments({ kind: kind === 'all' ? undefined : kind })
      .then(setPayments)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [kind]);

  useEffect(load, [load]);

  const collected = useMemo(
    () => payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Payments</h1>
          <p className="text-fasty-gray">Razorpay and cash collections across bookings and estimates</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-fasty-gray font-bold uppercase tracking-wide">Collected</p>
          <p className="text-2xl font-extrabold">₹{collected.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`chip ${
              kind === k ? 'bg-fasty-black text-fasty-yellow font-bold' : 'bg-fasty-light text-fasty-gray'
            }`}
          >
            {k === 'all' ? 'All' : k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-fasty-gray">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="card flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="chip bg-fasty-light text-fasty-gray text-[10px]">{p.kind}</span>
                  <span className={`chip text-[10px] ${STATUS_STYLES[p.status] ?? 'bg-gray-100'}`}>
                    {p.status}
                  </span>
                  <span className="chip bg-fasty-light text-fasty-gray text-[10px]">{p.method}</span>
                </div>
                <p className="text-sm font-bold mt-1">{p.customerName || 'Customer'}</p>
                <p className="text-xs text-fasty-gray">
                  {[
                    p.customerPhone,
                    p.razorpay.paymentId,
                    p.paidAt ? new Date(p.paidAt).toLocaleString('en-IN') : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <p className="font-extrabold text-lg">₹{p.amount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
