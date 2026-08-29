'use client';

import { useEffect, useState } from 'react';
import { adminPromoAudience, adminSendPromo, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<number | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadAudience() {
    try {
      const data = await adminPromoAudience();
      setRecipients(data.recipients);
      setPushEnabled(data.pushEnabled);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudience();
  }, []);

  async function send() {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) {
      toast('Title and message are required', 'error');
      return;
    }
    if (recipients === 0) {
      toast('No customers have a push token yet', 'error');
      return;
    }
    if (!window.confirm(`Send this promo to ${recipients ?? 0} customer device(s)?`)) {
      return;
    }

    setSending(true);
    try {
      const res = await adminSendPromo({ title: t, body: b });
      setPushEnabled(res.pushEnabled);
      toast(
        res.pushEnabled
          ? `Promo queued for ${res.recipients} device(s)`
          : `Logged only (EXPO_PUSH_ENABLED is off) — would reach ${res.recipients} device(s)`,
        'success',
      );
      setTitle('');
      setBody('');
      await loadAudience();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Push / Promos</h1>
        <p className="text-fasty-gray">
          Compose a promotional notification and send it to all customers who have the app installed
          with notifications enabled.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-black/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-fasty-gray">Audience</p>
          <p className="mt-1 text-3xl font-extrabold">
            {loading ? '…' : recipients ?? '—'}
          </p>
          <p className="text-sm text-fasty-gray">customers with a push token</p>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-fasty-gray">Server push</p>
          <p className="mt-1 text-3xl font-extrabold">
            {loading || pushEnabled === null ? '…' : pushEnabled ? 'On' : 'Off'}
          </p>
          <p className="text-sm text-fasty-gray">
            {pushEnabled === false
              ? 'Set EXPO_PUSH_ENABLED=true on the API to deliver for real'
              : 'Expo push delivery is enabled'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Title</label>
          <input
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 20% off RO service this weekend"
            maxLength={80}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Message</label>
          <textarea
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow min-h-[120px] resize-y"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Short promo copy shown under the title…"
            maxLength={240}
          />
          <p className="mt-1 text-xs text-fasty-gray">{body.length}/240</p>
        </div>
        <button
          type="button"
          onClick={send}
          disabled={sending || loading}
          className="btn-primary"
        >
          {sending ? 'Sending…' : 'Send promo'}
        </button>
      </div>
    </div>
  );
}
