'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  adminApproveExpert,
  adminGetExpert,
  adminRejectExpert,
  errorMessage,
  type AdminExpertDetail,
} from '@/lib/api';
import { toast } from '@/lib/toast';

function DocImage({ url, label }: { url?: string; label: string }) {
  if (!url) {
    return (
      <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-sm text-fasty-gray">
        {label} missing
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="w-full aspect-video object-cover rounded-xl border border-gray-100" />
      <p className="text-xs text-fasty-gray mt-1 font-semibold">{label}</p>
    </a>
  );
}

export default function AdminExpertDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [expert, setExpert] = useState<AdminExpertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminGetExpert(id);
      setExpert(data);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleApprove() {
    if (!id) return;
    setActing(true);
    try {
      const updated = await adminApproveExpert(id);
      setExpert((prev) => (prev ? { ...prev, ...updated } : updated));
      toast('Expert approved', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!id) return;
    if (!rejectNote.trim()) {
      toast('Enter a rejection reason', 'error');
      return;
    }
    setActing(true);
    try {
      const updated = await adminRejectExpert(id, rejectNote.trim());
      setExpert((prev) => (prev ? { ...prev, ...updated } : updated));
      setShowReject(false);
      setRejectNote('');
      toast('Expert rejected', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24" />)}</div>;
  }

  if (!expert) {
    return (
      <div className="card text-center py-16">
        <p className="text-fasty-gray mb-4">Expert not found.</p>
        <button type="button" className="btn-primary" onClick={() => router.push('/admin/experts')}>
          Back to list
        </button>
      </div>
    );
  }

  const docs = expert.documents || {};
  const bank = expert.bank || {};

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/experts" className="text-sm text-fasty-gray hover:underline">
          ← Back to experts
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{expert.name || 'Expert'}</h1>
            <p className="text-fasty-gray">{expert.phone}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="chip capitalize bg-gray-100 text-gray-700">{expert.kycStatus || 'pending'}</span>
              <span className="chip capitalize bg-gray-100 text-gray-700">{expert.status || 'offline'}</span>
              <span className="chip capitalize bg-gray-100 text-gray-700">
                {expert.specialization || 'general'}
              </span>
            </div>
            {expert.kycNote ? (
              <p className="text-sm text-red-700 mt-2">Note: {expert.kycNote}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            {expert.kycStatus !== 'verified' && (
              <button
                type="button"
                disabled={acting}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-sm disabled:opacity-50"
              >
                Approve
              </button>
            )}
            {expert.kycStatus !== 'rejected' && (
              <button
                type="button"
                disabled={acting}
                onClick={() => setShowReject((v) => !v)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </div>

      {showReject && (
        <div className="card mb-6 space-y-3">
          <label className="block text-sm font-bold">Rejection reason</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm"
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Explain what needs to be fixed..."
          />
          <button
            type="button"
            disabled={acting}
            onClick={handleReject}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50"
          >
            Confirm reject
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card space-y-4">
          <h2 className="font-extrabold text-lg">Documents</h2>
          <p className="text-sm text-fasty-gray">
            Aadhaar: <span className="font-semibold text-fasty-black">{docs.aadhaarNumber || '—'}</span>
          </p>
          <p className="text-sm text-fasty-gray">
            PAN: <span className="font-semibold text-fasty-black">{docs.panNumber || '—'}</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <DocImage url={docs.aadhaarFrontUrl} label="Aadhaar Front" />
            <DocImage url={docs.aadhaarBackUrl} label="Aadhaar Back" />
            <DocImage url={docs.panUrl} label="PAN Card" />
            <DocImage url={docs.selfieUrl || expert.photoUrl} label="Onboarding Selfie" />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-extrabold text-lg">Bank details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-fasty-gray">Holder</dt>
              <dd className="font-semibold">{bank.holderName || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fasty-gray">Account</dt>
              <dd className="font-semibold">{bank.accountNumber || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fasty-gray">IFSC</dt>
              <dd className="font-semibold">{bank.ifsc || '—'}</dd>
            </div>
          </dl>
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold mb-2">Stats</h3>
            <p className="text-sm text-fasty-gray">Jobs completed: {expert.completedJobs ?? 0}</p>
            <p className="text-sm text-fasty-gray">Rating: {expert.rating?.toFixed?.(1) ?? expert.rating ?? '—'}</p>
            <p className="text-sm text-fasty-gray">
              Submitted:{' '}
              {expert.kycSubmittedAt ? new Date(expert.kycSubmittedAt).toLocaleString('en-IN') : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-extrabold text-lg mb-4">Arrival selfies</h2>
        {!expert.arrivalSelfies?.length ? (
          <p className="text-fasty-gray text-sm">No arrival selfies captured yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expert.arrivalSelfies.map((s) => (
              <div key={s.bookingId} className="border border-gray-100 rounded-xl overflow-hidden">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.url} alt="Arrival selfie" className="w-full h-40 object-cover" />
                  </a>
                ) : (
                  <div className="h-40 bg-gray-100" />
                )}
                <div className="p-3 text-xs space-y-1">
                  <p className="font-bold text-sm">{s.serviceName}</p>
                  <p className="text-fasty-gray">{s.address || '—'}</p>
                  <p className="text-fasty-gray capitalize">{s.status}</p>
                  <p className="text-fasty-gray">
                    {s.capturedAt ? new Date(s.capturedAt).toLocaleString('en-IN') : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
