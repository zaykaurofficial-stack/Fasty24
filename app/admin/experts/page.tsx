'use client';

import { useEffect, useState } from 'react';
import { adminGetExperts, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

interface ExpertRow {
  publicId?: string;
  name?: string;
  phone?: string;
  status?: string;
  rating?: number;
  completedJobs?: number;
  skills?: string[];
  kycStatus?: string;
}

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<ExpertRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetExperts()
      .then((rows) => setExperts(rows as ExpertRow[]))
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Experts</h1>
      <p className="text-fasty-gray mb-6">Registered service professionals</p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : experts.length === 0 ? (
        <div className="card text-center py-16 text-fasty-gray">No experts yet.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-fasty-light text-fasty-gray text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Skills</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">KYC</th>
                <th className="px-5 py-3 font-semibold text-right">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {experts.map((e, i) => (
                <tr key={e.publicId ?? i} className="border-t border-gray-50">
                  <td className="px-5 py-3 font-semibold">{e.name || '—'}</td>
                  <td className="px-5 py-3 text-fasty-gray">{e.phone}</td>
                  <td className="px-5 py-3 text-fasty-gray">{(e.skills ?? []).join(', ') || '—'}</td>
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
                  <td className="px-5 py-3 capitalize text-fasty-gray">{e.kycStatus || '—'}</td>
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
