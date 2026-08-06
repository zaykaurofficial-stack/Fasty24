'use client';

import { useState } from 'react';
import {
  Part,
  Category,
  adminCreatePart,
  adminUpdatePart,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import ImageUploader from './ImageUploader';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const KINDS: Part['kind'][] = ['part', 'kit', 'consumable', 'labour'];
const UNITS = ['piece', 'set', 'litre', 'metre', 'kg', 'hour'];

interface Props {
  part: Part | 'new';
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function PartEditor({ part, categories, onClose, onSaved }: Props) {
  const isEdit = part !== 'new';
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: isEdit ? part.name : '',
    slug: isEdit ? part.slug : '',
    sku: isEdit ? part.sku : '',
    brand: isEdit ? part.brand : '',
    description: isEdit ? part.description : '',
    imageUrl: isEdit ? part.imageUrl : '',
    categories: isEdit ? part.categories : ([] as string[]),
    kind: isEdit ? part.kind : ('part' as Part['kind']),
    unit: isEdit ? part.unit : 'piece',
    price: isEdit ? String(part.price) : '',
    costPrice: isEdit ? String(part.costPrice ?? 0) : '',
    active: isEdit ? part.active : true,
  });

  function toggleCategory(slug: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(slug)
        ? f.categories.filter((c) => c !== slug)
        : [...f.categories, slug],
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast('Name is required', 'error');
      return;
    }
    if (form.price === '' || Number.isNaN(Number(form.price))) {
      toast('A valid price is required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      costPrice: Number(form.costPrice || 0),
      slug: form.slug || slugify(form.name),
    };
    try {
      if (isEdit) {
        await adminUpdatePart(part.id, payload);
        toast('Part updated', 'success');
      } else {
        await adminCreatePart(payload);
        toast('Part created', 'success');
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
        className="bg-white w-full max-w-lg h-full overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-lg">{isEdit ? 'Edit part' : 'New part'}</h2>
          <button onClick={onClose} className="text-fasty-gray font-bold">
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: isEdit ? form.slug : slugify(e.target.value),
                })
              }
              className="input-field"
              placeholder="RO Membrane 80 GPD"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold mb-1">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => toggleCategory(c.slug)}
                  className={`chip ${
                    form.categories.includes(c.slug)
                      ? 'bg-fasty-yellow text-fasty-black font-bold'
                      : 'bg-fasty-light text-fasty-gray'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-fasty-gray mt-2">
              Experts see this part when working on a job in any selected category.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold mb-1">Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as Part['kind'] })}
                className="input-field"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="input-field"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Cost price (₹)</label>
            <input
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-fasty-gray mt-1">Internal only — never shown to customers.</p>
          </div>

          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            label="Part image"
            height="h-36"
          />

          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[70px]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
