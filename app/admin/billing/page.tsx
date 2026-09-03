'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BillingConfig,
  BillingCompany,
  BillingTax,
  PlatformFeeSlab,
  TaxBase,
  adminGetBillingConfig,
  adminUpdateBillingConfig,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';

const TAX_BASES: { value: TaxBase; label: string; hint: string }[] = [
  {
    value: 'item_plus_fee',
    label: 'Service value + platform fee',
    hint: 'GST on the full service value and on the platform fee. The compliant reading if we are the deemed supplier under Section 9(5).',
  },
  {
    value: 'fee_only',
    label: 'Platform fee only',
    hint: 'GST on the platform fee alone. Service prices are treated as carrying no separate tax line.',
  },
  {
    value: 'commission_plus_fee',
    label: 'Our commission + platform fee',
    hint: 'GST on our revenue slice only. Lowest customer price, but it needs to be defensible.',
  },
];

export default function AdminBillingPage() {
  const [form, setForm] = useState<BillingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetBillingConfig()
      .then(setForm)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const saved = await adminUpdateBillingConfig({
        company: form.company,
        tax: form.tax,
        platformFee: form.platformFee,
        invoice: form.invoice,
      });
      setForm(saved);
      toast('Billing settings saved', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <div className="text-fasty-gray">Loading billing settings…</div>;
  }

  const patchCompany = (p: Partial<BillingCompany>) =>
    setForm((f) => (f ? { ...f, company: { ...f.company, ...p } } : f));
  const patchTax = (p: Partial<BillingTax>) =>
    setForm((f) => (f ? { ...f, tax: { ...f.tax, ...p } } : f));
  const patchSlabs = (slabs: PlatformFeeSlab[]) =>
    setForm((f) => (f ? { ...f, platformFee: { ...f.platformFee, slabs } } : f));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Billing &amp; tax</h1>
          <p className="text-fasty-gray max-w-2xl">
            These values drive what customers are charged and what gets printed on invoices. Changing
            the tax base or the fee slabs affects every new booking immediately — invoices already
            issued keep the details they were issued with.
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="btn-primary shrink-0">
          {saving ? 'Saving…' : 'Save all'}
        </button>
      </div>

      <Section
        title="Company and GST identity"
        hint="Printed as the supplier on both invoices. Leave GSTIN blank until registration is through — the invoice will omit the tax columns."
      >
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Legal entity name" value={form.company.legalName} onChange={(v) => patchCompany({ legalName: v })} />
          <Field label="Trade / brand name" value={form.company.tradeName} onChange={(v) => patchCompany({ tradeName: v })} />
          <Field label="GSTIN" value={form.company.gstin} onChange={(v) => patchCompany({ gstin: v.toUpperCase() })} />
          <Field label="PAN" value={form.company.pan} onChange={(v) => patchCompany({ pan: v.toUpperCase() })} />
          <Field label="CIN" value={form.company.cin} onChange={(v) => patchCompany({ cin: v.toUpperCase() })} />
          <Field label="Registered email" value={form.company.email} onChange={(v) => patchCompany({ email: v })} />
          <Field label="Registered phone" value={form.company.phone} onChange={(v) => patchCompany({ phone: v })} />
          <Field label="Logo URL" value={form.company.logoUrl} onChange={(v) => patchCompany({ logoUrl: v })} />
          <Field label="Address line 1" value={form.company.addressLine1} onChange={(v) => patchCompany({ addressLine1: v })} />
          <Field label="Address line 2" value={form.company.addressLine2} onChange={(v) => patchCompany({ addressLine2: v })} />
          <Field label="City" value={form.company.city} onChange={(v) => patchCompany({ city: v })} />
          <Field label="Pincode" value={form.company.pincode} onChange={(v) => patchCompany({ pincode: v })} />
          <Field label="State" value={form.company.state} onChange={(v) => patchCompany({ state: v })} />
          <Field
            label="State code"
            hint="Two digit GST state code, e.g. 09 for Uttar Pradesh. Decides CGST+SGST vs IGST."
            value={form.company.stateCode}
            onChange={(v) => patchCompany({ stateCode: v })}
          />
        </div>
      </Section>

      <Section title="Tax" hint="Rates and the base they are charged on.">
        <div className="grid md:grid-cols-3 gap-3">
          <Field
            label="Service GST %"
            type="number"
            value={String(form.tax.serviceGstPercent)}
            onChange={(v) => patchTax({ serviceGstPercent: Number(v) || 0 })}
          />
          <Field
            label="Platform fee GST %"
            type="number"
            value={String(form.tax.platformGstPercent)}
            onChange={(v) => patchTax({ platformGstPercent: Number(v) || 0 })}
          />
          <Field
            label="Commission %"
            hint="Only used by the commission + fee base."
            type="number"
            value={String(form.tax.commissionPercent)}
            onChange={(v) => patchTax({ commissionPercent: Number(v) || 0 })}
          />
        </div>

        <div className="space-y-2 mt-4">
          <span className="block text-sm font-semibold">Tax base</span>
          {TAX_BASES.map((opt) => (
            <label
              key={opt.value}
              className={`flex gap-3 items-start rounded-xl border p-3 cursor-pointer transition-colors ${
                form.tax.taxBase === opt.value
                  ? 'border-fasty-yellow bg-fasty-yellow/10'
                  : 'border-black/10 hover:border-black/20'
              }`}
            >
              <input
                type="radio"
                name="taxBase"
                className="mt-1 h-4 w-4 accent-fasty-yellow"
                checked={form.tax.taxBase === opt.value}
                onChange={() => patchTax({ taxBase: opt.value })}
              />
              <span>
                <span className="block text-sm font-bold">{opt.label}</span>
                <span className="block text-xs text-fasty-gray">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <Field
            label="SAC — services"
            hint="9987 covers maintenance, repair and installation."
            value={form.tax.sacService}
            onChange={(v) => patchTax({ sacService: v })}
          />
          <Field
            label="SAC — platform fee"
            hint="998599 covers other support services."
            value={form.tax.sacPlatform}
            onChange={(v) => patchTax({ sacPlatform: v })}
          />
        </div>
      </Section>

      <Section title="Platform fee" hint="A flat amount per price band, charged on top of the service value.">
        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-4 w-4 accent-fasty-yellow"
              checked={form.platformFee.enabled}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, platformFee: { ...f.platformFee, enabled: e.target.checked } } : f,
                )
              }
            />
            Charge a platform fee
          </label>
          <div className="flex-1 max-w-xs">
            <Field
              label="Label shown to customers"
              value={form.platformFee.label}
              onChange={(v) =>
                setForm((f) => (f ? { ...f, platformFee: { ...f.platformFee, label: v } } : f))
              }
            />
          </div>
        </div>

        <SlabEditor slabs={form.platformFee.slabs} onChange={patchSlabs} />
        <FeePreview config={form} />
      </Section>

      <Section title="Invoice series" hint="Numbers are reserved automatically at the moment a job completes, and reset each financial year.">
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label="Service invoice prefix"
            value={form.invoice.servicePrefix}
            onChange={(v) =>
              setForm((f) => (f ? { ...f, invoice: { ...f.invoice, servicePrefix: v } } : f))
            }
          />
          <Field
            label="Platform fee invoice prefix"
            value={form.invoice.platformPrefix}
            onChange={(v) =>
              setForm((f) => (f ? { ...f, invoice: { ...f.invoice, platformPrefix: v } } : f))
            }
          />
        </div>
        <p className="mt-2 text-xs text-fasty-gray">
          Current series: {form.invoice.financialYear || 'not started'} · service #
          {form.invoice.serviceSeq} · platform #{form.invoice.platformSeq}
        </p>
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-1.5">Terms printed on the invoice</label>
          <textarea
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow min-h-[96px] resize-y"
            value={form.invoice.termsText}
            onChange={(e) =>
              setForm((f) => (f ? { ...f, invoice: { ...f.invoice, termsText: e.target.value } } : f))
            }
          />
        </div>
      </Section>

      <button type="button" onClick={save} disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save all'}
      </button>
    </div>
  );
}

function SlabEditor({
  slabs,
  onChange,
}: {
  slabs: PlatformFeeSlab[];
  onChange: (slabs: PlatformFeeSlab[]) => void;
}) {
  function update(idx: number, patch: Partial<PlatformFeeSlab>) {
    onChange(slabs.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  const gaps = useMemo(() => {
    const sorted = [...slabs].sort((a, b) => a.minAmount - b.minAmount);
    const issues: string[] = [];
    sorted.forEach((s, i) => {
      const prev = sorted[i - 1];
      if (prev && prev.maxAmount != null && s.minAmount > prev.maxAmount + 1) {
        issues.push(`Nothing configured between ₹${prev.maxAmount} and ₹${s.minAmount}`);
      }
      if (prev && prev.maxAmount != null && s.minAmount <= prev.maxAmount) {
        issues.push(`Bands overlap around ₹${s.minAmount}`);
      }
    });
    if (sorted.length && sorted[sorted.length - 1].maxAmount != null) {
      issues.push('No open-ended top band — bookings above the highest band fall back to it');
    }
    return issues;
  }, [slabs]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-bold text-fasty-gray px-1">
        <span>From (₹)</span>
        <span>To (₹, blank = no limit)</span>
        <span>Fee (₹)</span>
        <span />
      </div>
      {slabs.map((slab, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <input
            type="number"
            min={0}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow"
            value={slab.minAmount}
            onChange={(e) => update(idx, { minAmount: Number(e.target.value) || 0 })}
          />
          <input
            type="number"
            min={0}
            placeholder="No limit"
            className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow"
            value={slab.maxAmount ?? ''}
            onChange={(e) =>
              update(idx, { maxAmount: e.target.value === '' ? null : Number(e.target.value) || 0 })
            }
          />
          <input
            type="number"
            min={0}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fasty-yellow"
            value={slab.fee}
            onChange={(e) => update(idx, { fee: Number(e.target.value) || 0 })}
          />
          <button
            type="button"
            onClick={() => onChange(slabs.filter((_, i) => i !== idx))}
            className="px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const last = slabs[slabs.length - 1];
          const nextMin = last?.maxAmount != null ? last.maxAmount + 1 : 0;
          onChange([...slabs, { minAmount: nextMin, maxAmount: null, fee: 0 }]);
        }}
        className="text-sm font-bold text-fasty-gray hover:text-black"
      >
        + Add band
      </button>
      {gaps.length > 0 && (
        <ul className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3 space-y-1">
          {gaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Mirrors src/services/billing.js computePricing so admin can sanity-check before saving. */
function FeePreview({ config }: { config: BillingConfig }) {
  const [amount, setAmount] = useState(999);

  const result = useMemo(() => {
    const net = Math.max(0, Math.round(amount));
    let fee = 0;
    if (config.platformFee.enabled) {
      const sorted = [...config.platformFee.slabs]
        .map((s) => ({ ...s, max: s.maxAmount == null || s.maxAmount <= 0 ? Infinity : s.maxAmount }))
        .sort((a, b) => a.minAmount - b.minAmount);
      const hit = sorted.find((s) => net >= s.minAmount && net <= s.max);
      const top = sorted[sorted.length - 1];
      if (hit) fee = Math.round(hit.fee);
      else if (top && net > top.max) fee = Math.round(top.fee);
    }
    let taxable = 0;
    if (config.tax.taxBase === 'item_plus_fee') taxable = net;
    else if (config.tax.taxBase === 'commission_plus_fee') {
      taxable = Math.round((net * config.tax.commissionPercent) / 100);
    }
    const serviceTax = Math.round((taxable * config.tax.serviceGstPercent) / 100);
    const feeTax = Math.round((fee * config.tax.platformGstPercent) / 100);
    return { fee, taxes: serviceTax + feeTax, total: net + fee + serviceTax + feeTax };
  }, [amount, config]);

  return (
    <div className="mt-5 rounded-2xl bg-fasty-black text-white p-4 max-w-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm font-bold">Preview</span>
        <input
          type="number"
          min={0}
          className="w-28 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-fasty-yellow"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
        />
      </div>
      <Row label="Item total" value={amount} />
      <Row label={config.platformFee.label || 'Platform fee'} value={result.fee} />
      <Row label="Est. Govt. taxes" value={result.taxes} />
      <div className="flex justify-between pt-2 mt-2 border-t border-white/15">
        <span className="text-sm font-extrabold">Total bill</span>
        <span className="text-sm font-extrabold text-fasty-yellow">₹{result.total}</span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm font-semibold">₹{value}</span>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6">
      <h2 className="text-lg font-extrabold">{title}</h2>
      {hint ? <p className="text-sm text-fasty-gray mb-4 max-w-2xl">{hint}</p> : <div className="mb-4" />}
      {children}
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
