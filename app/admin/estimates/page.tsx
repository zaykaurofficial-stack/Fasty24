'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminEstimate, adminGetEstimates, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-600',
};

const FILTERS = ['all', 'sent', 'approved', 'rejected'] as const;

export default function AdminEstimatesPage() {
  const [estimates, setEstimates] = useState<AdminEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<(typeof FILTERS)[number]>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminGetEstimates({ status: status === 'all' ? undefined : status })
      .then(setEstimates)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(load, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Estimates</h1>
        <p className="text-fasty-gray">On-site parts and repair quotes raised by experts</p>
      </div>

      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`chip ${
              status === f ? 'bg-fasty-black text-fasty-yellow font-bold' : 'bg-fasty-light text-fasty-gray'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-fasty-gray">No estimates yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {estimates.map((e) => (
            <div key={e.id} className="card">
              <button
                className="w-full flex flex-wrap items-center gap-4 text-left"
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              >
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold">{e.estimateNo}</p>
                    <span className={`chip text-[10px] ${STATUS_STYLES[e.status] ?? 'bg-gray-100'}`}>
                      {e.status}
                    </span>
                    {e.settled ? (
                      <span className="chip bg-green-100 text-green-800 text-[10px]">
                        Paid {e.payment.method === 'cash' ? 'cash' : 'online'}
                      </span>
                    ) : (
                      e.status === 'approved' && (
                        <span className="chip bg-red-100 text-red-700 text-[10px]">Unpaid</span>
                      )
                    )}
                    {e.status === 'approved' && !e.proofComplete && (
                      <span className="chip bg-amber-100 text-amber-800 text-[10px]">
                        Photo missing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-fasty-gray mt-0.5">
                    {[e.customerName, e.expertName, e.bookingId?.slice(0, 8)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <p className="font-extrabold text-lg">₹{e.pricing.total}</p>
              </button>

              {expanded === e.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {e.lines.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 text-sm">
                      <span className="flex-1">
                        {l.qty} × {l.name}
                        {l.isCustom && (
                          <span className="chip bg-blue-100 text-blue-800 text-[10px] ml-2">custom</span>
                        )}
                      </span>
                      <div className="flex gap-1">
                        {l.proofImages.map((p) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={p.url}
                            src={p.url}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                      <span className="font-bold w-20 text-right">₹{l.lineTotal}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-fasty-gray">Tax</span>
                    <span className="font-bold">₹{e.pricing.tax}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
