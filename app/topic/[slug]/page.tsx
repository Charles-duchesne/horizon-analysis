export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { getTagBySlug, getArticlesByTag } from '@/lib/db';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug);
  if (!tag) return { title: 'Topic | Horizon Analysis' };
  return { title: `#${tag.name} | Horizon Analysis`, description: `Articles tagged with ${tag.name}` };
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const tag = await getTagBySlug(params.slug);
  if (!tag) notFound();

  const articles = await getArticlesByTag(params.slug);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">#{tag.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No published articles with this tag yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </main>
    </div>
  );
}
