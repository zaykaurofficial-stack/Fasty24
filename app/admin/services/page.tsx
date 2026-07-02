'use client';

import { useEffect, useState } from 'react';
import {
  adminGetServices,
  adminGetCategories,
  adminDeleteService,
  Service,
  Category,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import ServiceEditor from '@/components/admin/ServiceEditor';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<{ open: boolean; service: Service | null }>({
    open: false,
    service: null,
  });

  function load() {
    setLoading(true);
    Promise.all([adminGetServices(), adminGetCategories()])
      .then(([s, c]) => {
        setServices(s);
        setCategories(c);
      })
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(svc: Service) {
    if (!confirm(`Delete "${svc.name}"? It will be hidden from customers.`)) return;
    try {
      await adminDeleteService(svc.slug);
      toast('Service deleted', 'info');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Services</h1>
          <p className="text-fasty-gray">Manage your catalog, descriptions and process images</p>
        </div>
        <button onClick={() => setEditor({ open: true, service: null })} className="btn-primary">
          + New service
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-16 text-fasty-gray">
          <p className="font-semibold">No services yet.</p>
          <p className="text-sm mt-1">Create your first service to get started.</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-fasty-light text-fasty-gray text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Content</th>
                <th className="px-5 py-3 font-semibold text-right">Price</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.slug} className="border-t border-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-fasty-light flex items-center justify-center shrink-0">
                        {s.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '🛠️'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-fasty-gray">{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-fasty-gray">{s.categories.join(', ') || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`chip text-[10px] ${s.description ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {s.description ? 'Desc ✓' : 'No desc'}
                      </span>
                      <span className={`chip text-[10px] ${s.process.length ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {s.process.length} steps
                      </span>
                      {!s.active && <span className="chip text-[10px] bg-red-100 text-red-700">Inactive</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-bold">₹{s.price}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-3 justify-end text-xs font-semibold">
                      <button onClick={() => setEditor({ open: true, service: s })} className="text-fasty-black hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editor.open && (
        <ServiceEditor
          service={editor.service}
          categories={categories}
          onClose={() => setEditor({ open: false, service: null })}
          onSaved={load}
        />
      )}
    </div>
  );
}
