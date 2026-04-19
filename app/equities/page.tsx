export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import SectionBadge from '@/components/SectionBadge';
import { getPublishedArticles } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Equities | Horizon Analysis',
  description: 'Latest equities analysis and market insights from Horizon Analysis.',
};

export default async function EquitiesPage() {
  const articles = await getPublishedArticles('equities');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <SectionBadge section="equities" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Equities</h1>
        </div>
        {articles.length === 0
          ? <p className="text-gray-500 dark:text-gray-400 text-sm">No articles in this section yet.</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{articles.map(a => <ArticleCard key={a.id} article={a} />)}</div>}
      </main>
    </div>
  );
}
