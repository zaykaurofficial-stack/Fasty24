'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminGetOfferReport, errorMessage, type ExpertOfferReportRow, type ExpertOfferStats } from '@/lib/api';
import { toast } from '@/lib/toast';

const emptyTotals: ExpertOfferStats = {
  accepted: 0,
  declined: 0,
  ignored: 0,
  totalOffers: 0,
  acceptanceRate: 0,
};

export default function AdminOfferReportPage() {
  const [rows, setRows] = useState<ExpertOfferReportRow[]>([]);
  const [totals, setTotals] = useState<ExpertOfferStats>(emptyTotals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetOfferReport()
      .then((data) => {
        setRows(data.experts || []);
        setTotals(data.totals || emptyTotals);
      })
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Offer report</h1>
      <p className="text-fasty-gray mb-6">
        How experts respond to job offers: accept, decline, or ignore (let the timer run out).
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Offers sent', value: totals.totalOffers },
          { label: 'Accepted', value: totals.accepted },
          { label: 'Declined', value: totals.declined },
          { label: 'Ignored', value: totals.ignored },
        ].map((c) => (
          <div key={c.label} className="card">
            <div className="text-2xl font-extrabold">{loading ? '—' : c.value}</div>
            <div className="text-sm text-fasty-gray">{c.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="card text-center py-16 text-fasty-gray">No offer activity yet.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-fasty-light text-fasty-gray text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Expert</th>
                <th className="px-5 py-3 font-semibold text-right">Accepted</th>
                <th className="px-5 py-3 font-semibold text-right">Declined</th>
                <th className="px-5 py-3 font-semibold text-right">Ignored</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
                <th className="px-5 py-3 font-semibold text-right">Accept %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.expertId} className="border-t border-gray-50 hover:bg-gray-50/80">
                  <td className="px-5 py-3">
                    <Link href={`/admin/experts/${row.expertId}`} className="font-semibold hover:underline">
                      {row.name}
                    </Link>
                    <p className="text-xs text-fasty-gray">{row.phone}</p>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-green-700">{row.accepted}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-700">{row.declined}</td>
                  <td className="px-5 py-3 text-right font-bold text-orange-700">{row.ignored}</td>
                  <td className="px-5 py-3 text-right">{row.totalOffers}</td>
                  <td className="px-5 py-3 text-right font-bold">{row.acceptanceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
