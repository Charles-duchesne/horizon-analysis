'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import ArticleForm from '@/components/ArticleForm';

export default function NewArticlePage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('horizon_admin') !== 'true') {
      router.replace('/admin');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Article</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ArticleForm mode="new" />
        </div>
      </main>
    </div>
  );
}
