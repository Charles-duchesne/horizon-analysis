export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { getAuthorByName, getArticlesByAuthorName } from '@/lib/db';

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const name = decodeURIComponent(params.name);
  return { title: `${name} | Horizon Analysis` };
}

export default async function AuthorPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const [author, articles] = await Promise.all([
    getAuthorByName(name),
    getArticlesByAuthorName(name),
  ]);

  if (!author && articles.length === 0) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start gap-5 mb-10">
          {author?.avatar_url && (
            <img src={author.avatar_url} alt={author.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{author?.name ?? name}</h1>
            {author?.bio && <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm max-w-xl">{author.bio}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No published articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </main>
    </div>
  );
}
