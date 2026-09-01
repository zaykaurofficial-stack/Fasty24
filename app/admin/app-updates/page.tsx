'use client';

import { useEffect, useState } from 'react';
import {
  AppConfig,
  AppVersionConfig,
  adminGetAppConfig,
  adminUpdateAppConfig,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';

type AppKey = 'expert' | 'customer';

const APP_META: Record<AppKey, { label: string; hint: string }> = {
  expert: {
    label: 'Fasty24 Expert',
    hint: 'Partner Android app (com.fasty24.expert). Use this after you publish a new Play Store build.',
  },
  customer: {
    label: 'Fasty24 Customer',
    hint: 'Customer Android app (com.fasty24.app).',
  },
};

export default function AdminAppUpdatesPage() {
  const [form, setForm] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<AppKey | null>(null);

  useEffect(() => {
    adminGetAppConfig()
      .then(setForm)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  function patch(app: AppKey, patch: Partial<AppVersionConfig>) {
    setForm((prev) => (prev ? { ...prev, [app]: { ...prev[app], ...patch } } : prev));
  }

  async function save(app: AppKey) {
    if (!form) return;
    setSaving(app);
    try {
      const saved = await adminUpdateAppConfig({ [app]: form[app] });
      setForm(saved);
      toast(`${APP_META[app].label} update settings saved`, 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(null);
    }
  }

  if (loading || !form) {
    return <div className="text-fasty-gray">Loading app update settings…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">App updates</h1>
        <p className="text-fasty-gray max-w-2xl">
          After a Play Store upload goes live, set the minimum version code to that new build and turn
          on force update. Testers on older installs will see a blocking modal and cannot use the app
          until they update. Leave force update off (or min version at 0) while this current build is
          still the latest.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {(['expert', 'customer'] as AppKey[]).map((app) => (
          <AppCard
            key={app}
            app={app}
            value={form[app]}
            saving={saving === app}
            onChange={(p) => patch(app, p)}
            onSave={() => save(app)}
          />
        ))}
      </div>
    </div>
  );
}

function AppCard({
  app,
  value,
  saving,
  onChange,
  onSave,
}: {
  app: AppKey;
  value: AppVersionConfig;
  saving: boolean;
  onChange: (patch: Partial<AppVersionConfig>) => void;
  onSave: () => void;
}) {
  const meta = APP_META[app];
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">{meta.label}</h2>
          <p className="text-sm text-fasty-gray">{meta.hint}</p>
        </div>
        <label className="flex items-center gap-2 shrink-0 text-sm font-semibold">
          <input
            type="checkbox"
            checked={value.forceUpdate}
            onChange={(e) => onChange({ forceUpdate: e.target.checked })}
            className="h-4 w-4 accent-fasty-yellow"
          />
          Force update
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Latest version name"
          hint="Shown in the modal, e.g. 1.0.1"
          value={value.latestVersion}
          onChange={(v) => onChange({ latestVersion: v })}
        />
        <Field
          label="Latest version code"
          hint="Android versionCode of the new Play Store build"
          type="number"
          value={String(value.latestVersionCode)}
          onChange={(v) => onChange({ latestVersionCode: Number(v) || 0 })}
        />
        <Field
          label="Minimum version code"
          hint="Installed builds below this are blocked when force update is on"
          type="number"
          value={String(value.minVersionCode)}
          onChange={(v) => onChange({ minVersionCode: Number(v) || 0 })}
        />
        <Field
          label="Android package"
          value={value.androidPackage}
          onChange={(v) => onChange({ androidPackage: v })}
        />
      </div>

      <Field
        label="Play Store URL"
        value={value.storeUrl}
        onChange={(v) => onChange({ storeUrl: v })}
      />
      <Field
        label="Modal title"
        value={value.title}
        onChange={(v) => onChange({ title: v })}
      />
      <div>
        <label className="block text-sm font-semibold mb-1.5">Modal message</label>
        <textarea
          className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow min-h-[96px] resize-y"
          value={value.message}
          onChange={(e) => onChange({ message: e.target.value })}
        />
      </div>

      <button type="button" onClick={onSave} disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'number';
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <input
        type={type}
        min={type === 'number' ? 0 : undefined}
        className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-fasty-gray">{hint}</p> : null}
    </div>
  );
}
