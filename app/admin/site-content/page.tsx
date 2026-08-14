'use client';

import { useEffect, useState } from 'react';
import {
  SiteContent,
  adminGetSiteContent,
  adminUpdateSiteContent,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';

type FormState = SiteContent;

export default function AdminSiteContentPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSiteContent()
      .then(setForm)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const saved = await adminUpdateSiteContent(form);
      setForm(saved);
      toast('Homepage content saved', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <div className="text-fasty-gray">Loading homepage content…</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Homepage CMS</h1>
          <p className="text-fasty-gray">
            Edit marketing copy, stats, cities, testimonials, and CTAs shown on the public site.
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary shrink-0">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <Section title="Contact & Cities">
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Phone"
            value={form.site.phone}
            onChange={(v) => setForm({ ...form, site: { ...form.site, phone: v } })}
          />
          <Field
            label="Email"
            value={form.site.email}
            onChange={(v) => setForm({ ...form, site: { ...form.site, email: v } })}
          />
          <Field
            label="Tagline"
            value={form.site.tagline}
            onChange={(v) => setForm({ ...form, site: { ...form.site, tagline: v } })}
          />
          <Field
            label="Cities (comma-separated)"
            value={form.site.cities.join(', ')}
            onChange={(v) =>
              setForm({
                ...form,
                site: {
                  ...form.site,
                  cities: v
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </div>
      </Section>

      <Section title="Hero">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Pill text" value={form.hero.pill} onChange={(v) => setForm({ ...form, hero: { ...form.hero, pill: v } })} />
          <Field label="Title line 1" value={form.hero.titleLine1} onChange={(v) => setForm({ ...form, hero: { ...form.hero, titleLine1: v } })} />
          <Field label="Title line 2" value={form.hero.titleLine2} onChange={(v) => setForm({ ...form, hero: { ...form.hero, titleLine2: v } })} />
          <Field label="Title highlight" value={form.hero.titleHighlight} onChange={(v) => setForm({ ...form, hero: { ...form.hero, titleHighlight: v } })} />
          <Field label="Social rating" value={form.hero.socialProofRating} onChange={(v) => setForm({ ...form, hero: { ...form.hero, socialProofRating: v } })} />
          <Field label="Social proof text" value={form.hero.socialProofText} onChange={(v) => setForm({ ...form, hero: { ...form.hero, socialProofText: v } })} />
        </div>
        <TextArea
          label="Subtitle"
          value={form.hero.subtitle}
          onChange={(v) => setForm({ ...form, hero: { ...form.hero, subtitle: v } })}
        />
        <ListEditor
          title="Hero mini cards"
          items={form.hero.cards}
          onChange={(cards) => setForm({ ...form, hero: { ...form.hero, cards } })}
          fields={[
            { key: 'icon', label: 'Icon' },
            { key: 'title', label: 'Title' },
            { key: 'priceLabel', label: 'Price label' },
          ]}
          empty={{ icon: '✨', title: '', priceLabel: '' }}
        />
      </Section>

      <Section title="Stats bar">
        <ListEditor
          title="Stats"
          items={form.stats}
          onChange={(stats) => setForm({ ...form, stats })}
          fields={[
            { key: 'value', label: 'Value' },
            { key: 'label', label: 'Label' },
          ]}
          empty={{ value: '', label: '' }}
        />
        <Field
          label="Trust items (comma-separated)"
          value={form.trustItems.join(', ')}
          onChange={(v) =>
            setForm({
              ...form,
              trustItems: v
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean),
            })
          }
        />
      </Section>

      <Section title="Why Fasty-24">
        <ListEditor
          title="Why cards"
          items={form.whyUs}
          onChange={(whyUs) => setForm({ ...form, whyUs })}
          fields={[
            { key: 'icon', label: 'Icon' },
            { key: 'title', label: 'Title' },
            { key: 'desc', label: 'Description' },
          ]}
          empty={{ icon: '✨', title: '', desc: '' }}
        />
      </Section>

      <Section title="Testimonials">
        <ListEditor
          title="Customer stories"
          items={form.testimonials}
          onChange={(testimonials) => setForm({ ...form, testimonials })}
          fields={[
            { key: 'name', label: 'Name' },
            { key: 'text', label: 'Quote' },
            { key: 'avatar', label: 'Avatar URL' },
          ]}
          empty={{ name: '', text: '', avatar: '', rating: 5 }}
        />
      </Section>

      <Section title="FAQ">
        <ListEditor
          title="Questions"
          items={form.faq}
          onChange={(faq) => setForm({ ...form, faq })}
          fields={[
            { key: 'q', label: 'Question' },
            { key: 'a', label: 'Answer' },
          ]}
          empty={{ q: '', a: '' }}
        />
      </Section>

      <Section title="Bottom CTA">
        <div className="grid md:grid-cols-1 gap-4">
          <Field
            label="Title"
            value={form.cta.title}
            onChange={(v) => setForm({ ...form, cta: { ...form.cta, title: v } })}
          />
          <Field
            label="Subtitle"
            value={form.cta.subtitle}
            onChange={(v) => setForm({ ...form, cta: { ...form.cta, subtitle: v } })}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-fasty-gray uppercase tracking-wide">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-fasty-gray uppercase tracking-wide">{label}</span>
      <textarea
        className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm min-h-[96px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ListEditor<T extends Record<string, unknown>>({
  title,
  items,
  onChange,
  fields,
  empty,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  fields: { key: keyof T & string; label: string }[];
  empty: T;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{title}</h3>
        <button
          type="button"
          className="text-sm font-semibold text-fasty-black underline"
          onClick={() => onChange([...items, { ...empty }])}
        >
          + Add
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="grid md:grid-cols-3 gap-3 p-3 rounded-xl bg-fasty-light/80 border border-black/5">
          {fields.map((f) => (
            <label key={f.key} className="block md:col-span-1">
              <span className="text-[11px] font-bold text-fasty-gray uppercase">{f.label}</span>
              <input
                className="mt-1 w-full rounded-lg border border-black/10 px-2.5 py-2 text-sm"
                value={String(item[f.key] ?? '')}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...item, [f.key]: e.target.value };
                  onChange(next);
                }}
              />
            </label>
          ))}
          <div className="md:col-span-3 flex justify-end">
            <button
              type="button"
              className="text-xs font-semibold text-red-600"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
