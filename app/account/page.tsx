'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    if (!getUser()) { router.push('/login?redirect=/account'); return; }
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
    if (!addrForm.line1.trim()) { toast('Address line is required', 'error'); return; }
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
      <main className="min-h-screen bg-fasty-black pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="h-8 w-40 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-fasty-black text-white">
      {/* Header */}
      <section className="relative pt-28 pb-8 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-fasty-yellow/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 flex items-start justify-between">
          <div>
            <Link href="/" className="text-gray-500 hover:text-fasty-yellow text-sm transition-colors mb-4 inline-flex items-center gap-1">← Home</Link>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-fasty-yellow/15 border border-fasty-yellow/20 flex items-center justify-center text-2xl font-extrabold text-fasty-yellow">
                {(me?.name || me?.phone || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">{me?.name || 'My Account'}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{me?.phone}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/'); }}
            className="text-sm font-bold text-red-400 hover:text-red-300 px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
          >
            Logout
          </button>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Quick links */}
        <Link
          href="/bookings"
          className="flex items-center justify-between bg-[#141414] border border-white/8 rounded-2xl px-5 py-4 hover:border-fasty-yellow/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="font-semibold text-white">My Bookings</span>
          </div>
          <svg className="w-4 h-4 text-gray-500 group-hover:text-fasty-yellow group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Profile */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-fasty-yellow/15 flex items-center justify-center text-sm">👤</span>
            Profile
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-fasty-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-fasty-yellow/50 transition-colors placeholder:text-gray-600"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-fasty-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-fasty-yellow/50 transition-colors placeholder:text-gray-600"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-fasty-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-fasty-yellow/50 transition-colors"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-fasty-yellow text-fasty-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {/* Addresses */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-fasty-yellow/15 flex items-center justify-center text-sm">📍</span>
              Saved Addresses
            </h2>
            <button
              onClick={() => { setEditingAddr('new'); setAddrForm(EMPTY_ADDR); }}
              className="text-xs font-bold text-fasty-yellow bg-fasty-yellow/10 border border-fasty-yellow/20 px-3 py-1.5 rounded-lg hover:bg-fasty-yellow/20 transition-colors"
            >
              + Add address
            </button>
          </div>

          <div className="space-y-3">
            {(me?.addresses ?? []).map((a) => (
              <div key={a.id} className="rounded-xl border border-white/8 bg-fasty-black/40 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white text-sm flex items-center gap-2">
                      {a.label}
                      {a.isDefault && (
                        <span className="text-[10px] font-bold text-fasty-yellow bg-fasty-yellow/10 border border-fasty-yellow/20 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {[a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold shrink-0">
                    {!a.isDefault && (
                      <button onClick={() => makeDefault(a.id)} className="text-gray-500 hover:text-fasty-yellow transition-colors">
                        Set default
                      </button>
                    )}
                    <button onClick={() => startEdit(a)} className="text-gray-500 hover:text-white transition-colors">Edit</button>
                    <button onClick={() => removeAddress(a.id)} className="text-red-500 hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}

            {(me?.addresses ?? []).length === 0 && editingAddr === null && (
              <p className="text-sm text-gray-500 text-center py-4">No saved addresses yet.</p>
            )}
          </div>

          {editingAddr !== null && (
            <div className="mt-4 rounded-xl border border-fasty-yellow/30 bg-fasty-yellow/5 p-4 space-y-3">
              <p className="font-bold text-sm text-white">{editingAddr === 'new' ? 'New address' : 'Edit address'}</p>
              <input
                value={addrForm.label}
                onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                placeholder="Label (Home, Office…)"
                className="w-full px-4 py-3 bg-fasty-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-fasty-yellow/50 transition-colors placeholder:text-gray-600"
              />
              <input
                value={addrForm.line1}
                onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                placeholder="House no., street, landmark"
                className="w-full px-4 py-3 bg-fasty-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-fasty-yellow/50 transition-colors placeholder:text-gray-600"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={addrForm.city}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-4 py-3 bg-fasty-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-fasty-yellow/50 transition-colors placeholder:text-gray-600"
                />
                <input
                  value={addrForm.pincode}
                  onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full px-4 py-3 bg-fasty-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-fasty-yellow/50 transition-colors placeholder:text-gray-600"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveAddress}
                  disabled={saving}
                  className="bg-fasty-yellow text-fasty-black font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingAddr(null); setAddrForm(EMPTY_ADDR); }}
                  className="border border-white/20 text-gray-300 font-bold px-5 py-2.5 rounded-xl hover:border-white/40 hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
