export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { searchArticles } from '@/lib/db';

export const metadata: Metadata = { title: 'Search | Horizon Analysis' };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? '';
  const results = query.length > 1 ? await searchArticles(query) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {query && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
        )}

        {!query && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Use the search bar in the header to find articles.</p>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No results found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try different keywords or browse a section.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </main>
    </div>
  );
}
