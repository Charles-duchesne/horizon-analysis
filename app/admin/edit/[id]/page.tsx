'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import ArticleForm from '@/components/ArticleForm';
import { Article } from '@/lib/db';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('horizon_admin') !== 'true') {
      router.replace('/admin');
      return;
    }
    fetch(`/api/articles/${params.id}`)
      .then(res => {
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then(data => {
        if (data) setArticle(data);
        setLoading(false);
      });
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Article not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Article</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ArticleForm mode="edit" article={article} />
        </div>
      </main>
    </div>
  );
}
