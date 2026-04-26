'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import SectionBadge from '@/components/SectionBadge';
import { Article } from '@/lib/db';

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notifying, setNotifying] = useState<number | null>(null);
  const [notifyMsg, setNotifyMsg] = useState<string>('');
  const [section, setSection] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (localStorage.getItem('horizon_admin') !== 'true') {
      router.replace('/admin');
      return;
    }
    fetchArticles();
  }, [router]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/articles');
    const data = await res.json();
    setArticles(data);
    setLoading(false);
  }, []);

  async function handleNotify(articleId: number) {
    setNotifying(articleId);
    setNotifyMsg('');
    const res = await fetch('/api/notify-subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    });
    const data = await res.json();
    setNotifyMsg(res.ok ? `✓ Sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}` : `Error: ${data.error}`);
    setNotifying(null);
    setTimeout(() => setNotifyMsg(''), 4000);
  }

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    await fetch(`/api/articles/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    setDeleting(false);
    fetchArticles();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifyMsg && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{notifyMsg}</div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Articles</h1>
          <Link
            href="/admin/new"
            className="bg-[#0f1e35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a5c] transition-colors"
          >
            + New Article
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />

          {/* Section filters */}
          <div className="flex items-center gap-1.5">
            {['all', 'economy', 'politics', 'equities', 'others'].map(s => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  section === s
                    ? 'bg-[#0f1e35] text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'All Sections' : s}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 ml-auto">
            {[['all', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatus(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  status === val
                    ? 'bg-[#0f1e35] text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No articles yet.</p>
            <Link href="/admin/new" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
              Create your first article →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Section</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Author</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.filter(a => {
                  if (section !== 'all' && a.section !== section) return false;
                  if (status === 'published' && !a.published) return false;
                  if (status === 'draft' && a.published) return false;
                  if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
                  return true;
                }).map(article => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{article.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <SectionBadge section={article.section} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{article.author}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(article.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        article.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${article.published ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/edit/${article.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit
                        </Link>
                        {article.published === 1 && (
                          <button
                            onClick={() => handleNotify(article.id)}
                            disabled={notifying === article.id}
                            className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-50"
                          >
                            {notifying === article.id ? 'Sending...' : 'Notify'}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(article.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {articles.filter(a => {
                  if (section !== 'all' && a.section !== section) return false;
                  if (status === 'published' && !a.published) return false;
                  if (status === 'draft' && a.published) return false;
                  if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
                  return true;
                }).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                      No articles match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Article?</h2>
            <p className="text-sm text-gray-600 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
