'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Article, Author, Tag } from '@/lib/db';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

type Props = { article?: Article; mode: 'new' | 'edit' };

export default function ArticleForm({ article, mode }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: article?.title ?? '',
    section: article?.section ?? 'economy',
    author_id: article?.author_id?.toString() ?? '',
    summary: article?.summary ?? '',
    content: article?.content ?? '',
    cover_image_url: article?.cover_image_url ?? '',
    published: !!article?.published,
    publish_at: article?.publish_at ?? '',
    tags: (article?.tags ?? []).map((t: Tag) => t.name).join(', '),
  });

  const [authors, setAuthors] = useState<Author[]>([]);
  const [slugPreview, setSlugPreview] = useState(article?.slug ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(article?.cover_image_url ?? '');

  useEffect(() => {
    fetch('/api/authors').then(r => r.json()).then(setAuthors);
  }, []);

  useEffect(() => {
    if (mode === 'new') setSlugPreview(slugify(form.title));
  }, [form.title, mode]);

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        update('cover_image_url', data.url);
        setImagePreview(data.url);
      } else {
        setError(data.error ?? 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(publishOverride?: boolean) {
    setError('');
    const published = publishOverride !== undefined ? publishOverride : form.published;
    if (!form.title.trim() || !form.author_id || !form.content.trim()) {
      setError('Title, author, and content are required.');
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const url = mode === 'new' ? '/api/articles' : `/api/articles/${article!.id}`;
      const method = mode === 'new' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, author_id: Number(form.author_id), published, tags }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900';

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input type="text" value={form.title} onChange={e => update('title', e.target.value)} className={inputCls} placeholder="Article title" />
        {slugPreview && <p className="text-xs text-gray-400 mt-1">Slug: <span className="font-mono">{slugPreview}</span></p>}
      </div>

      {/* Section + Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section <span className="text-red-500">*</span></label>
          <select value={form.section} onChange={e => update('section', e.target.value)} className={inputCls}>
            <option value="economy">Economy</option>
            <option value="politics">Politics</option>
            <option value="equities">Equities</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author <span className="text-red-500">*</span></label>
          <select value={form.author_id} onChange={e => update('author_id', e.target.value)} className={inputCls}>
            <option value="">Select author...</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
        <textarea value={form.summary} onChange={e => update('summary', e.target.value)} rows={2}
          className={`${inputCls} resize-none`} placeholder="Short description shown on article cards (2-3 sentences)" />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)} className={inputCls}
          placeholder="economy, inflation, fed (comma-separated)" />
        <p className="text-xs text-gray-400 mt-1">Separate tags with commas. New tags are created automatically.</p>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setImageMode('url')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${imageMode === 'url' ? 'bg-[#0f1e35] text-white border-[#0f1e35]' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            URL
          </button>
          <button type="button" onClick={() => setImageMode('upload')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${imageMode === 'upload' ? 'bg-[#0f1e35] text-white border-[#0f1e35]' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            Upload
          </button>
        </div>
        {imageMode === 'url' ? (
          <input type="url" value={form.cover_image_url} onChange={e => { update('cover_image_url', e.target.value); setImagePreview(e.target.value); }}
            className={inputCls} placeholder="https://example.com/image.jpg (optional)" />
        ) : (
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors w-full text-left disabled:opacity-50">
              {uploading ? 'Uploading...' : '+ Click to upload image'}
            </button>
          </div>
        )}
        {imagePreview && (
          <div className="mt-2 relative">
            <img src={imagePreview} alt="Preview" className="h-32 rounded-lg object-cover" onError={() => setImagePreview('')} />
            <button type="button" onClick={() => { setImagePreview(''); update('cover_image_url', ''); }}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">Remove</button>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
        <RichTextEditor value={form.content} onChange={val => update('content', val)} />
      </div>

      {/* Status + Schedule */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => update('published', !form.published)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.published ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-gray-700">{form.published ? 'Published' : 'Draft'}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Schedule publish:</label>
          <input type="datetime-local" value={form.publish_at} onChange={e => update('publish_at', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
        <button onClick={() => handleSubmit()} disabled={saving}
          className="bg-gray-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
        <button onClick={() => handleSubmit(true)} disabled={saving}
          className="bg-[#0f1e35] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a5c] transition-colors disabled:opacity-50">
          {saving ? 'Publishing...' : 'Publish'}
        </button>
        <button onClick={() => router.push('/admin/dashboard')} disabled={saving}
          className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
