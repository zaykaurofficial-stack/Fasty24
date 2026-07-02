'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, setAdminToken, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await adminLogin(password);
      setAdminToken(res.token);
      toast('Welcome back, admin', 'success');
      router.replace('/admin');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo href="/admin" size="lg" variant="light" suffix="Admin" suffixClassName="font-extrabold text-2xl" />
          </div>
          <p className="text-fasty-gray">Sign in to manage the catalog</p>
        </div>
        <div className="card shadow-lift !p-8">
          <label className="block text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="input-field mb-6"
            placeholder="••••••••"
          />
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
