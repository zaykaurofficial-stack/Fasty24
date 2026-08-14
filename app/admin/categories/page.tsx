'use client';

import { useEffect, useState } from 'react';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  Category,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import ImageUploader from '@/components/admin/ImageUploader';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

type RateItemForm = { name: string; price: number; notes: string };
type RateBrandForm = { name: string; items: RateItemForm[] };

const EMPTY = {
  name: '',
  slug: '',
  icon: '',
  imageUrl: '',
  description: '',
  sortOrder: 0,
  supportsScheduling: true,
  active: true,
  rateCard: { title: 'Rate card', brands: [] as RateBrandForm[] },
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminGetCategories()
      .then(setCategories)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startNew() {
    setForm(EMPTY);
    setEditing('new');
  }

  function startEdit(c: Category) {
    setForm({
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? '',
      imageUrl: c.imageUrl ?? '',
      description: c.description ?? '',
      sortOrder: c.sortOrder ?? 0,
      supportsScheduling: c.supportsScheduling,
      active: c.active,
      rateCard: {
        title: c.rateCard?.title || 'Rate card',
        brands:
          (c.rateCard?.brands?.length
            ? c.rateCard.brands
            : [{ name: '', items: [] }]
          ).map((b) => ({
            name: b.name || '',
            items: (b.items || []).map((i) => ({
              name: i.name || '',
              price: Number(i.price) || 0,
              notes: i.notes || '',
            })),
          })),
      },
    });
    setEditing(c);
  }

  async function save() {
    if (!form.name.trim() || !form.slug.trim()) {
      toast('Name and slug are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        rateCard: {
          title: form.rateCard.title.trim() || 'Rate card',
          brands: form.rateCard.brands
            .map((b) => ({
              name: b.name.trim(),
              items: b.items
                .filter((i) => i.name.trim())
                .map((i) => ({ name: i.name.trim(), price: Number(i.price) || 0, notes: i.notes.trim() })),
            }))
            .filter((b) => b.name || b.items.length),
          items: [],
        },
      };
      if (editing === 'new') {
        await adminCreateCategory(payload);
        toast('Category created', 'success');
      } else if (editing) {
        await adminUpdateCategory(editing.slug, payload);
        toast('Category updated', 'success');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Categories</h1>
          <p className="text-fasty-gray">Organize services into browsable groups</p>
        </div>
        <button onClick={startNew} className="btn-primary">
          + New category
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.slug} className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-fasty-light flex items-center justify-center text-2xl shrink-0">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    c.icon || '🗂️'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{c.name}</p>
                  <p className="text-xs text-fasty-gray">{c.slug}</p>
                </div>
                {!c.active && <span className="chip bg-red-100 text-red-700 text-[10px]">Inactive</span>}
                {(c.rateCard?.brands?.some((b) => (b.items?.length ?? 0) > 0) ?? false) && (
                  <span className="chip bg-yellow-100 text-yellow-800 text-[10px]">Rate card</span>
                )}
              </div>
              <p className="text-sm text-fasty-gray mt-2 line-clamp-2 min-h-[2.5rem]">{c.description}</p>
              <button onClick={() => startEdit(c)} className="text-sm font-bold text-fasty-yellow hover:underline mt-2">
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-extrabold text-lg mb-4">{editing === 'new' ? 'New category' : 'Edit category'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value, slug: editing === 'new' ? slugify(e.target.value) : form.slug })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Icon</label>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="input-field text-center"
                    placeholder="❄️"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="input-field" />
              </div>
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                label="Category image"
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
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={form.supportsScheduling}
                    onChange={(e) => setForm({ ...form, supportsScheduling: e.target.checked })}
                  />
                  Scheduling
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Active
                </label>
                <div className="flex items-center gap-2 text-sm font-bold">
                  Sort
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="input-field !py-1 w-16"
                  />
                </div>
              </div>
              <div className="border-t border-black/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-extrabold">Rate card (by brand)</p>
                    <p className="text-xs text-fasty-gray">One modal on service pages. Add Kent, Pureit, etc. — users scroll to see each table.</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-bold text-fasty-black underline"
                    onClick={() =>
                      setForm({
                        ...form,
                        rateCard: {
                          ...form.rateCard,
                          brands: [...form.rateCard.brands, { name: '', items: [{ name: '', price: 0, notes: '' }] }],
                        },
                      })
                    }
                  >
                    + Add brand
                  </button>
                </div>
                <label className="block text-sm font-bold mb-1">Modal title</label>
                <input
                  value={form.rateCard.title}
                  onChange={(e) => setForm({ ...form, rateCard: { ...form.rateCard, title: e.target.value } })}
                  className="input-field mb-3"
                  placeholder="RO Rate card"
                />
                <div className="space-y-4">
                  {form.rateCard.brands.map((brand, bIdx) => (
                    <div key={bIdx} className="rounded-xl border border-black/10 p-3 bg-fasty-light/60">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          className="input-field flex-1"
                          placeholder="Brand name (e.g. Kent)"
                          value={brand.name}
                          onChange={(e) => {
                            const brands = [...form.rateCard.brands];
                            brands[bIdx] = { ...brand, name: e.target.value };
                            setForm({ ...form, rateCard: { ...form.rateCard, brands } });
                          }}
                        />
                        <button
                          type="button"
                          className="text-xs font-bold text-red-600 shrink-0"
                          onClick={() =>
                            setForm({
                              ...form,
                              rateCard: {
                                ...form.rateCard,
                                brands: form.rateCard.brands.filter((_, i) => i !== bIdx),
                              },
                            })
                          }
                        >
                          Remove brand
                        </button>
                      </div>
                      {brand.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-start mb-2">
                          <input
                            className="input-field col-span-5"
                            placeholder="Item"
                            value={item.name}
                            onChange={(e) => {
                              const brands = [...form.rateCard.brands];
                              const items = [...brand.items];
                              items[idx] = { ...item, name: e.target.value };
                              brands[bIdx] = { ...brand, items };
                              setForm({ ...form, rateCard: { ...form.rateCard, brands } });
                            }}
                          />
                          <input
                            type="number"
                            className="input-field col-span-3"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => {
                              const brands = [...form.rateCard.brands];
                              const items = [...brand.items];
                              items[idx] = { ...item, price: Number(e.target.value) };
                              brands[bIdx] = { ...brand, items };
                              setForm({ ...form, rateCard: { ...form.rateCard, brands } });
                            }}
                          />
                          <input
                            className="input-field col-span-3"
                            placeholder="Notes"
                            value={item.notes}
                            onChange={(e) => {
                              const brands = [...form.rateCard.brands];
                              const items = [...brand.items];
                              items[idx] = { ...item, notes: e.target.value };
                              brands[bIdx] = { ...brand, items };
                              setForm({ ...form, rateCard: { ...form.rateCard, brands } });
                            }}
                          />
                          <button
                            type="button"
                            className="col-span-1 text-xs font-bold text-red-600 pt-2"
                            onClick={() => {
                              const brands = [...form.rateCard.brands];
                              brands[bIdx] = { ...brand, items: brand.items.filter((_, i) => i !== idx) };
                              setForm({ ...form, rateCard: { ...form.rateCard, brands } });
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-xs font-bold underline"
                        onClick={() => {
                          const brands = [...form.rateCard.brands];
                          brands[bIdx] = { ...brand, items: [...brand.items, { name: '', price: 0, notes: '' }] };
                          setForm({ ...form, rateCard: { ...form.rateCard, brands } });
                        }}
                      >
                        + Add row
                      </button>
                    </div>
                  ))}
                  {form.rateCard.brands.length === 0 && (
                    <p className="text-xs text-fasty-gray">No brands yet. Add Kent, Pureit, Aquaguard, etc.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)} className="btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
