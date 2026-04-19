export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import SectionBadge from '@/components/SectionBadge';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReadingProgress from '@/components/ReadingProgress';
import SocialShare from '@/components/SocialShare';
import RelatedArticles from '@/components/RelatedArticles';
import NewsletterSignup from '@/components/NewsletterSignup';
import Link from 'next/link';
import { getArticleBySlug, getRelatedArticles } from '@/lib/db';
import { readingTime } from '@/lib/readingTime';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://horizonanalysis.com';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: 'Not Found | Horizon Analysis' };
  const url = `${BASE_URL}/article/${article.slug}`;
  return {
    title: `${article.title} | Horizon Analysis`,
    description: article.summary ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.summary ?? undefined,
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : [],
      type: 'article',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.section);
  const mins = readingTime(article.content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ReadingProgress section={article.section} />
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <SectionBadge section={article.section} />
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {article.title}
          </h1>
          {article.summary && (
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{article.summary}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-3 text-sm">
              {article.author_avatar_url && (
                <img src={article.author_avatar_url} alt={article.author} className="w-8 h-8 rounded-full object-cover" />
              )}
              <div>
                <Link href={`/author/${encodeURIComponent(article.author)}`}
                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {article.author}
                </Link>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <time>{formatDate(article.created_at)}</time>
                  {article.updated_at !== article.created_at && <span> · Updated {formatDate(article.updated_at)}</span>}
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{mins} min read</span>
            <SocialShare title={article.title} />
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map(tag => (
                <Link key={tag.id} href={`/topic/${tag.slug}`}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {article.cover_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={article.cover_image_url} alt={article.title} className="w-full h-64 sm:h-96 object-cover" />
          </div>
        )}

        <article className="dark:prose-invert">
          <MarkdownRenderer content={article.content} />
        </article>

        <RelatedArticles articles={related} section={article.section} />

        <div className="mt-12">
          <NewsletterSignup />
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Horizon Analysis. All rights reserved.
      </footer>
    </div>
  );
}
