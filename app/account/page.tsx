'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMe,
  getUser,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  setAuth,
  clearAuth,
  getAuthToken,
  Address,
  Principal,
  errorMessage,
} from '@/lib/api';
import { toast } from '@/lib/toast';

const EMPTY_ADDR = { label: 'Home', line1: '', line2: '', city: '', pincode: '' };

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Principal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');

  const [editingAddr, setEditingAddr] = useState<string | 'new' | null>(null);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);

  function load() {
    return getMe()
      .then(({ principal }) => {
        setMe(principal);
        setName(principal.name ?? '');
        setEmail(principal.email ?? '');
        setGender(principal.gender || 'prefer_not_to_say');
      })
      .catch((err) => toast(errorMessage(err), 'error'));
  }

  useEffect(() => {
    if (!getUser()) {
      router.push('/login?redirect=/account');
      return;
    }
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function saveProfile() {
    setSaving(true);
    try {
      await updateProfile({ name, email, gender });
      const stored = getUser();
      const token = getAuthToken();
      if (stored && token) setAuth(token, { ...stored, name });
      toast('Profile updated', 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function saveAddress() {
    if (!addrForm.line1.trim()) {
      toast('Address line is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingAddr === 'new') {
        await addAddress({ ...addrForm, lat: 28.6139, lng: 77.209 });
        toast('Address added', 'success');
      } else if (editingAddr) {
        await updateAddress(editingAddr, addrForm);
        toast('Address updated', 'success');
      }
      setEditingAddr(null);
      setAddrForm(EMPTY_ADDR);
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function removeAddress(id: string) {
    try {
      await deleteAddress(id);
      toast('Address removed', 'info');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  async function makeDefault(id: string) {
    try {
      await setDefaultAddress(id);
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  function startEdit(a: Address) {
    setEditingAddr(a.id);
    setAddrForm({ label: a.label, line1: a.line1, line2: a.line2, city: a.city, pincode: a.pincode });
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-40 mb-6" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-fasty-black text-white py-12">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">My Account</h1>
            <p className="text-gray-400 mt-1">{me?.phone}</p>
          </div>
          <button
            onClick={() => {
              clearAuth();
              router.push('/');
            }}
            className="btn-ghost-white !py-2 !px-5 text-sm"
          >
            Logout
          </button>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Profile */}
        <div className="card !p-6">
          <h2 className="font-bold text-lg mb-4">Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@email.com" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary mt-5">
            Save changes
          </button>
        </div>

        {/* Addresses */}
        <div className="card !p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Saved addresses</h2>
            <button
              onClick={() => {
                setEditingAddr('new');
                setAddrForm(EMPTY_ADDR);
              }}
              className="text-sm font-bold text-fasty-yellow hover:underline"
            >
              + Add address
            </button>
          </div>

          <div className="space-y-3">
            {(me?.addresses ?? []).map((a) => (
              <div key={a.id} className="rounded-xl border-2 border-gray-100 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">
                      {a.label}{' '}
                      {a.isDefault && <span className="chip bg-fasty-yellow/20 text-fasty-black text-[10px]">Default</span>}
                    </p>
                    <p className="text-sm text-fasty-gray mt-0.5">
                      {[a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold shrink-0">
                    {!a.isDefault && (
                      <button onClick={() => makeDefault(a.id)} className="text-fasty-black hover:underline">
                        Set default
                      </button>
                    )}
                    <button onClick={() => startEdit(a)} className="text-fasty-black hover:underline">
                      Edit
                    </button>
                    <button onClick={() => removeAddress(a.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(me?.addresses ?? []).length === 0 && editingAddr === null && (
              <p className="text-sm text-fasty-gray">No saved addresses yet.</p>
            )}
          </div>

          {editingAddr !== null && (
            <div className="mt-4 rounded-xl border-2 border-fasty-yellow/40 p-4 space-y-3 bg-fasty-yellow/5">
              <p className="font-bold text-sm">{editingAddr === 'new' ? 'New address' : 'Edit address'}</p>
              <input
                value={addrForm.label}
                onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                placeholder="Label (Home, Office...)"
                className="input-field"
              />
              <input
                value={addrForm.line1}
                onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                placeholder="House no., street, landmark"
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={addrForm.city}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  placeholder="City"
                  className="input-field"
                />
                <input
                  value={addrForm.pincode}
                  onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={saveAddress} disabled={saving} className="btn-primary !py-2.5">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingAddr(null);
                    setAddrForm(EMPTY_ADDR);
                  }}
                  className="btn-outline !py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
