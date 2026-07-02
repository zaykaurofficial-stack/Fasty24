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

const EMPTY = {
  name: '',
  slug: '',
  icon: '',
  imageUrl: '',
  description: '',
  sortOrder: 0,
  supportsScheduling: true,
  active: true,
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
      if (editing === 'new') {
        await adminCreateCategory(form);
        toast('Category created', 'success');
      } else if (editing) {
        await adminUpdateCategory(editing.slug, form);
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
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
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
