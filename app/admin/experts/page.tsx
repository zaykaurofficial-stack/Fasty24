'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminGetExperts, errorMessage, type AdminExpert } from '@/lib/api';
import { toast } from '@/lib/toast';

const KYC_FILTERS = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Pending Review' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'pending', label: 'Not Submitted' },
];

function kycChip(status?: string) {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<AdminExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycFilter, setKycFilter] = useState('submitted');

  useEffect(() => {
    setLoading(true);
    adminGetExperts(kycFilter || undefined)
      .then((rows) => setExperts(rows))
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [kycFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1">Experts</h1>
          <p className="text-fasty-gray">Review onboarding applications and manage professionals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {KYC_FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              type="button"
              onClick={() => setKycFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                kycFilter === f.value
                  ? 'bg-fasty-black text-fasty-yellow border-fasty-black'
                  : 'bg-white text-fasty-gray border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : experts.length === 0 ? (
        <div className="card text-center py-16 text-fasty-gray">No experts match this filter.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-fasty-light text-fasty-gray text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Specialization</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">KYC</th>
                <th className="px-5 py-3 font-semibold text-right">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {experts.map((e, i) => (
                <tr key={e.id ?? i} className="border-t border-gray-50 hover:bg-gray-50/80">
                  <td className="px-5 py-3 font-semibold">
                    <Link href={`/admin/experts/${e.id}`} className="hover:underline">
                      {e.name || '—'}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-fasty-gray">{e.phone}</td>
                  <td className="px-5 py-3 text-fasty-gray capitalize">{e.specialization || 'general'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`chip ${
                        e.status === 'online'
                          ? 'bg-green-100 text-green-800'
                          : e.status === 'on_job'
                            ? 'bg-fasty-black text-fasty-yellow'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {e.status || 'offline'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`chip capitalize ${kycChip(e.kycStatus)}`}>
                      {e.kycStatus || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold">{e.completedJobs ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
