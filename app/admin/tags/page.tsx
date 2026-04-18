'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { Tag } from '@/lib/db';

export default function AdminTagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('horizon_admin') !== 'true') { router.replace('/admin'); return; }
    fetchTags();
  }, [router]);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/tags');
    setTags(await res.json());
    setLoading(false);
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this tag? It will be removed from all articles.')) return;
    await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    fetchTags();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tags</h1>
        <p className="text-sm text-gray-500 mb-6">Tags are created automatically when you add them to articles.</p>

        {loading ? <p className="text-gray-500 text-sm">Loading...</p> : tags.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No tags yet. Add tags when creating or editing articles.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tag</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tags.map(tag => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">#{tag.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{tag.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(tag.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
