'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminNav from '@/components/AdminNav';

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ name: '', bio: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('horizon_admin') !== 'true') { router.replace('/admin'); return; }
    fetch(`/api/authors/${params.id}`)
      .then(r => r.json())
      .then(data => { setForm({ name: data.name ?? '', bio: data.bio ?? '', avatar_url: data.avatar_url ?? '' }); setLoading(false); });
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/authors/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/admin/authors');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to update author');
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Author</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <input type="url" value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} className={inputCls} placeholder="https://..." />
                {form.avatar_url && <img src={form.avatar_url} alt="Preview" className="mt-2 w-12 h-12 rounded-full object-cover" />}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-[#0f1e35] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a5c] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => router.push('/admin/authors')} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
