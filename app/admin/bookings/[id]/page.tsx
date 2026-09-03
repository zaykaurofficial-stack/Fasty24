'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  adminAssignBooking,
  adminGetBooking,
  getInvoiceLink,
  errorMessage,
  STATUS_LABELS,
  type AdminAssignCandidate,
  type AdminBookingDetail,
} from '@/lib/api';
import { toast } from '@/lib/toast';

function offerChip(status: string) {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    case 'ignored':
      return 'bg-orange-100 text-orange-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [expertId, setExpertId] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminGetBooking(id);
      setBooking(data);
      const recommended = data.candidates?.find((c) => c.recommended);
      setExpertId(recommended?.id || data.candidates?.[0]?.id || '');
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

  const candidates = booking?.candidates || [];
  const selected: AdminAssignCandidate | undefined = useMemo(
    () => candidates.find((c) => c.id === expertId),
    [candidates, expertId],
  );

  async function handleAssign() {
    if (!id || !expertId) return;
    setAssigning(expertId);
    try {
      await adminAssignBooking(id, expertId);
      toast('Expert assigned', 'success');
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setAssigning(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card text-center py-16">
        <p className="text-fasty-gray mb-4">Job not found.</p>
        <button type="button" className="btn-primary" onClick={() => router.push('/admin/bookings')}>
          Back to jobs
        </button>
      </div>
    );
  }

  const status = STATUS_LABELS[booking.status] ?? { label: booking.status, color: 'bg-gray-100' };
  const slot = booking.scheduledSlot;
  const canDownloadInvoice =
    booking.status === 'completed' && booking.payment?.status === 'paid';

  async function handleDownloadInvoice() {
    if (!id) return;
    setInvoiceLoading(true);
    try {
      const { url } = await getInvoiceLink(id, true);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setInvoiceLoading(false);
    }
  }

  return (
    <div>
      <Link href="/admin/bookings" className="text-sm text-fasty-gray hover:underline">
        ← Back to jobs
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">{booking.items.map((i) => i.name).join(', ') || 'Job'}</h1>
          <p className="text-fasty-gray mt-1">
            {booking.customer?.name || 'Customer'} · {booking.customer?.phone || '—'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`chip ${status.color}`}>{status.label}</span>
            <span className="chip bg-gray-100 text-gray-700 capitalize">{booking.bookingType}</span>
            {slot ? (
              <span className="chip bg-blue-100 text-blue-800">
                {slot.date} · {slot.label || slot.window}
              </span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold">₹{booking.pricing?.total ?? 0}</p>
          {canDownloadInvoice && (
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={invoiceLoading}
              className="mt-2 text-sm font-bold text-fasty-gray hover:text-black disabled:opacity-50"
            >
              {invoiceLoading ? 'Preparing…' : 'Download invoice ↓'}
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card space-y-2 text-sm">
            <h2 className="font-extrabold text-lg">Job details</h2>
            <p className="text-fasty-gray">{booking.location?.address || '—'}</p>
            <p className="text-fasty-gray">
              Expert: <span className="font-semibold text-fasty-black">{booking.expert?.name || 'Unassigned'}</span>
              {booking.expert?.phone ? ` · ${booking.expert.phone}` : ''}
            </p>
            <p className="text-fasty-gray">Payment: {booking.payment?.status || '—'}</p>
          </div>

          {booking.canAssign ? (
            <div className="card space-y-4">
              <h2 className="font-extrabold text-lg">Assign expert</h2>
              <p className="text-sm text-fasty-gray">
                No expert accepted this offer. Pick someone below to assign the job.
              </p>
              {candidates.length === 0 ? (
                <p className="text-sm text-fasty-gray">No matching experts found for this service.</p>
              ) : (
                <>
                  <select
                    className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm bg-white"
                    value={expertId}
                    onChange={(e) => setExpertId(e.target.value)}
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.busy && booking.bookingType !== 'scheduled'}>
                        {c.name} · {c.status}
                        {c.distanceKm != null ? ` · ${c.distanceKm} km` : ''}
                        {c.declined ? ' · declined' : ''}
                        {c.slotConflict ? ' · slot clash' : ''}
                        {c.busy ? ' · on a job' : ''}
                      </option>
                    ))}
                  </select>
                  {selected?.declined || selected?.slotConflict ? (
                    <p className="text-xs text-orange-700">
                      This expert previously declined or already has a job in this slot. You can still override.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!expertId || !!assigning}
                    onClick={handleAssign}
                  >
                    {assigning ? 'Assigning…' : 'Assign job'}
                  </button>
                </>
              )}
            </div>
          ) : null}

          <div className="card !p-0 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-extrabold text-lg">Offer history</h2>
              <p className="text-sm text-fasty-gray mt-1">
                Accepted, declined, and ignored (timed out with no tap).
              </p>
            </div>
            {!booking.offers?.length ? (
              <p className="p-8 text-center text-fasty-gray text-sm">No offers recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-fasty-light text-fasty-gray text-left">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Expert</th>
                    <th className="px-5 py-3 font-semibold">Result</th>
                    <th className="px-5 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.offers.map((o) => (
                    <tr key={o.id} className="border-t border-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-semibold">{o.expert?.name || '—'}</p>
                        <p className="text-xs text-fasty-gray">{o.expert?.phone}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`chip capitalize ${offerChip(o.status)}`}>{o.status}</span>
                        <span className="text-xs text-fasty-gray ml-2">
                          {o.source === 'admin_assign' ? 'admin' : 'offer'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-fasty-gray">
                        {new Date(o.respondedAt || o.offeredAt || '').toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="card">
            <h2 className="font-extrabold mb-3">Matching experts</h2>
            <div className="space-y-2 max-h-[480px] overflow-auto">
              {candidates.slice(0, 12).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setExpertId(c.id)}
                  className={`w-full text-left rounded-xl border p-3 ${
                    expertId === c.id ? 'border-fasty-yellow bg-fasty-yellow/10' : 'border-gray-100'
                  }`}
                >
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-fasty-gray mt-0.5">
                    {c.status} · {c.completedJobs} jobs
                    {c.distanceKm != null ? ` · ${c.distanceKm} km` : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
