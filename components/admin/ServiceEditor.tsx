'use client';

import { useEffect, useState } from 'react';
import {
  adminCreateService,
  adminUpdateService,
  adminUploadImages,
  Service,
  Category,
  ProcessStep,
  ServiceFaq,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import ImageUploader from './ImageUploader';

interface ServiceEditorProps {
  service: Service | null; // null = create
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ServiceEditor({ service, categories, onClose, onSaved }: ServiceEditorProps) {
  const isEdit = !!service;
  const [originalSlug] = useState(service?.slug ?? '');
  const [saving, setSaving] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [form, setForm] = useState({
    name: service?.name ?? '',
    slug: service?.slug ?? '',
    skillTag: service?.skillTag ?? '',
    categories: service?.categories ?? [],
    price: service?.price ?? 499,
    durationMin: service?.durationMin ?? 60,
    serviceKind: service?.serviceKind ?? 'standard',
    shortDescription: service?.shortDescription ?? '',
    description: service?.description ?? '',
    imageUrl: service?.imageUrl ?? '',
    gallery: service?.gallery ?? [],
    process: (service?.process ?? []) as ProcessStep[],
    inclusions: service?.inclusions ?? [],
    exclusions: service?.exclusions ?? [],
    faqs: (service?.faqs ?? []) as ServiceFaq[],
    active: service?.active ?? true,
  });

  useEffect(() => {
    if (!isEdit && form.name && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCategory(slug: string) {
    set(
      'categories',
      form.categories.includes(slug)
        ? form.categories.filter((c) => c !== slug)
        : [...form.categories, slug],
    );
  }

  /* Gallery */
  async function addGalleryFiles(files: FileList) {
    setGalleryUploading(true);
    try {
      const res = await adminUploadImages(Array.from(files));
      set('gallery', [...form.gallery, ...res.images.map((i) => i.url)]);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setGalleryUploading(false);
    }
  }

  /* Process steps */
  function addStep() {
    set('process', [...form.process, { title: '', description: '', imageUrl: '', order: form.process.length }]);
  }
  function updateStep(i: number, patch: Partial<ProcessStep>) {
    set(
      'process',
      form.process.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );
  }
  function removeStep(i: number) {
    set('process', form.process.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx })));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim() || !form.skillTag.trim()) {
      toast('Name, slug and skill tag are required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      durationMin: Number(form.durationMin),
      process: form.process.map((s, idx) => ({ ...s, order: idx })),
      inclusions: form.inclusions.filter((i) => i.trim()),
      exclusions: form.exclusions.filter((e) => e.trim()),
      faqs: form.faqs.filter((f) => f.q.trim()),
    };
    try {
      if (isEdit) {
        await adminUpdateService(originalSlug, payload);
        toast('Service updated', 'success');
      } else {
        await adminCreateService(payload);
        toast('Service created', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-2xl h-full bg-white overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-extrabold text-lg">{isEdit ? 'Edit service' : 'New service'}</h2>
          <button onClick={onClose} className="text-2xl text-fasty-gray hover:text-fasty-black">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">Service name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Slug</label>
              <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Skill tag</label>
              <input
                value={form.skillTag}
                onChange={(e) => set('skillTag', e.target.value)}
                className="input-field"
                placeholder="e.g. ac_service"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value as unknown as number)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Duration (min)</label>
              <input
                type="number"
                value={form.durationMin}
                onChange={(e) => set('durationMin', e.target.value as unknown as number)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Service kind</label>
              <select
                value={form.serviceKind}
                onChange={(e) => set('serviceKind', e.target.value as typeof form.serviceKind)}
                className="input-field"
              >
                <option value="standard">Standard</option>
                <option value="timed">Timed</option>
                <option value="addon_only">Add-on only</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
                Active
              </label>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-bold mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.slug)}
                  className={`chip border ${
                    form.categories.includes(c.slug)
                      ? 'bg-fasty-black text-white border-fasty-black'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-bold mb-2">Short description</label>
            <input
              value={form.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              className="input-field"
              placeholder="One-line summary shown on cards"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Full description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Detailed description shown on the service page"
            />
          </div>

          {/* Main image */}
          <ImageUploader value={form.imageUrl} onChange={(url) => set('imageUrl', url)} label="Main image" />

          {/* Gallery */}
          <div>
            <label className="block text-sm font-bold mb-2">Gallery</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {form.gallery.map((g, i) => (
                <div key={i} className="relative h-20 rounded-lg overflow-hidden border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set('gallery', form.gallery.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-block">
              <span className="btn-outline !py-2 !px-4 text-sm cursor-pointer">
                {galleryUploading ? 'Uploading...' : '+ Add gallery images'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addGalleryFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {/* How we do it / process */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold">How we do it (process steps)</label>
              <button type="button" onClick={addStep} className="text-sm font-bold text-fasty-yellow hover:underline">
                + Add step
              </button>
            </div>
            <div className="space-y-4">
              {form.process.map((step, i) => (
                <div key={i} className="rounded-xl border-2 border-gray-100 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm">Step {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={step.title}
                    onChange={(e) => updateStep(i, { title: e.target.value })}
                    placeholder="Step title"
                    className="input-field mb-2"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(i, { description: e.target.value })}
                    placeholder="What happens in this step"
                    className="input-field mb-2 min-h-[60px]"
                  />
                  <ImageUploader
                    value={step.imageUrl}
                    onChange={(url) => updateStep(i, { imageUrl: url })}
                    label="Step image"
                    height="h-32"
                  />
                </div>
              ))}
              {form.process.length === 0 && (
                <p className="text-sm text-fasty-gray">
                  No steps yet. Add a visual walkthrough of how this service is performed.
                </p>
              )}
            </div>
          </div>

          {/* Inclusions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold">Inclusions</label>
              <button
                type="button"
                onClick={() => set('inclusions', [...form.inclusions, ''])}
                className="text-sm font-bold text-fasty-yellow hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {form.inclusions.map((inc, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={inc}
                    onChange={(e) => set('inclusions', form.inclusions.map((v, idx) => (idx === i ? e.target.value : v)))}
                    className="input-field"
                    placeholder="e.g. Genuine parts included"
                  />
                  <button
                    type="button"
                    onClick={() => set('inclusions', form.inclusions.filter((_, idx) => idx !== i))}
                    className="text-fasty-gray hover:text-red-600 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold">Exclusions (what&apos;s not included)</label>
              <button
                type="button"
                onClick={() => set('exclusions', [...form.exclusions, ''])}
                className="text-sm font-bold text-fasty-yellow hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {form.exclusions.map((exc, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={exc}
                    onChange={(e) =>
                      set('exclusions', form.exclusions.map((v, idx) => (idx === i ? e.target.value : v)))
                    }
                    className="input-field"
                    placeholder="e.g. Spare parts cost not included"
                  />
                  <button
                    type="button"
                    onClick={() => set('exclusions', form.exclusions.filter((_, idx) => idx !== i))}
                    className="text-fasty-gray hover:text-red-600 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.exclusions.length === 0 && (
                <p className="text-xs text-fasty-gray">Nothing marked as excluded yet.</p>
              )}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold">FAQs</label>
              <button
                type="button"
                onClick={() => set('faqs', [...form.faqs, { q: '', a: '' }])}
                className="text-sm font-bold text-fasty-yellow hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {form.faqs.map((f, i) => (
                <div key={i} className="rounded-xl border-2 border-gray-100 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs">FAQ {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => set('faqs', form.faqs.filter((_, idx) => idx !== i))}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={f.q}
                    onChange={(e) => set('faqs', form.faqs.map((v, idx) => (idx === i ? { ...v, q: e.target.value } : v)))}
                    placeholder="Question"
                    className="input-field mb-2"
                  />
                  <textarea
                    value={f.a}
                    onChange={(e) => set('faqs', form.faqs.map((v, idx) => (idx === i ? { ...v, a: e.target.value } : v)))}
                    placeholder="Answer"
                    className="input-field min-h-[60px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create service'}
          </button>
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
