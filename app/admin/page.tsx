'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ADMIN_PASSWORD = 'horizonadmin2024';
const STORAGE_KEY = 'horizon_admin';

export default function AdminGatePage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1e35] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo.png"
              alt="Horizon Analysis logo"
              width={72}
              height={72}
              className="rounded-full"
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-[#0f1e35]">Horizon Analysis</h1>
          <p className="text-xs text-gray-400 tracking-wide mt-0.5">Making It Simple</p>
          <p className="text-sm text-gray-500 mt-3">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#0f1e35] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a5c] transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
