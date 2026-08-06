'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Part,
  Category,
  adminGetParts,
  adminGetCategories,
  adminApprovePart,
  adminRejectPart,
  adminDeletePart,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import PartEditor from '@/components/admin/PartEditor';

type Filter = 'all' | 'pending' | 'approved';

export default function AdminPartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Part | 'new' | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminGetParts({
      verificationStatus: filter === 'all' ? undefined : filter,
      category: category || undefined,
      q: query || undefined,
    })
      .then(setParts)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [filter, category, query]);

  useEffect(load, [load]);

  useEffect(() => {
    adminGetCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const pendingCount = parts.filter((p) => p.verificationStatus === 'pending').length;

  async function approve(part: Part) {
    setBusyId(part.id);
    const draft = priceDrafts[part.id];
    try {
      await adminApprovePart(part.id, draft !== undefined ? { price: Number(draft) } : {});
      toast(`${part.name} approved`, 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(part: Part) {
    setBusyId(part.id);
    try {
      await adminRejectPart(part.id);
      toast(`${part.name} rejected`, 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(part: Part) {
    if (!confirm(`Delete "${part.name}"? This cannot be undone.`)) return;
    setBusyId(part.id);
    try {
      await adminDeletePart(part.id);
      toast('Part deleted', 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Parts catalog</h1>
          <p className="text-fasty-gray">
            Parts and kits experts can add to on-site estimates
            {pendingCount > 0 && (
              <span className="ml-2 chip bg-amber-100 text-amber-800 text-[11px] font-bold">
                {pendingCount} awaiting verification
              </span>
            )}
          </p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary">
          + New part
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(['all', 'pending', 'approved'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip ${
              filter === f ? 'bg-fasty-black text-fasty-yellow font-bold' : 'bg-fasty-light text-fasty-gray'
            }`}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending verification' : 'Approved'}
          </button>
        ))}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field !py-1.5 !w-auto ml-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, SKU, brand"
          className="input-field !py-1.5 !w-auto flex-1 min-w-[200px]"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : parts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-fasty-gray">No parts match these filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parts.map((p) => {
            const isPending = p.verificationStatus === 'pending';
            return (
              <div
                key={p.id}
                className={`card flex flex-wrap items-center gap-4 ${
                  isPending ? 'border-amber-300 bg-amber-50/40' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-fasty-light flex items-center justify-center shrink-0">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🔩</span>
                  )}
                </div>

                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold">{p.name}</p>
                    {p.kind !== 'part' && (
                      <span className="chip bg-fasty-light text-fasty-gray text-[10px]">{p.kind}</span>
                    )}
                    {p.source === 'expert_custom' && (
                      <span className="chip bg-blue-100 text-blue-800 text-[10px]">
                        Added by {p.createdByExpertName || 'expert'}
                      </span>
                    )}
                    {p.verificationStatus === 'rejected' && (
                      <span className="chip bg-red-100 text-red-700 text-[10px]">Rejected</span>
                    )}
                    {!p.active && (
                      <span className="chip bg-gray-200 text-gray-700 text-[10px]">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-fasty-gray mt-0.5">
                    {[p.brand, p.sku, p.categories.join(', '), `used ${p.usageCount}×`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-fasty-gray">₹</span>
                      <input
                        type="number"
                        defaultValue={p.price}
                        onChange={(e) =>
                          setPriceDrafts((d) => ({ ...d, [p.id]: e.target.value }))
                        }
                        className="input-field !py-1 w-24"
                      />
                    </div>
                    <button
                      onClick={() => approve(p)}
                      disabled={busyId === p.id}
                      className="btn-primary !py-1.5 !px-4 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(p)}
                      disabled={busyId === p.id}
                      className="btn-outline !py-1.5 !px-4 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <p className="font-extrabold text-lg">₹{p.price}</p>
                    <button
                      onClick={() => setEditing(p)}
                      className="text-sm font-bold text-fasty-yellow hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p)}
                      disabled={busyId === p.id}
                      className="text-sm font-bold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <PartEditor
          part={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
