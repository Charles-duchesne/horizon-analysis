export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import SectionBadge from '@/components/SectionBadge';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getPublishedArticles, Article } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Horizon Analysis — Making It Simple',
  description: 'In-depth business and economic analysis. Making complex markets simple.',
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function HeroArticle({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block relative rounded-xl overflow-hidden bg-[#0f1e35] text-white min-h-[420px] flex flex-col justify-end">
      {article.cover_image_url && (
        <img src={article.cover_image_url} alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300" />
      )}
      <div className="relative z-10 p-6 sm:p-10 bg-gradient-to-t from-[#0f1e35]/95 via-[#0f1e35]/60 to-transparent">
        <SectionBadge section={article.section} />
        <h1 className="mt-3 text-2xl sm:text-4xl font-bold leading-tight group-hover:text-blue-200 transition-colors">
          {article.title}
        </h1>
        {article.summary && <p className="mt-2 text-gray-300 text-sm sm:text-base max-w-2xl line-clamp-2">{article.summary}</p>}
        <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
          <span>{article.author}</span><span>·</span><span>{formatDate(article.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

const sections = ['economy', 'politics', 'equities', 'others'] as const;

export default function HomePage() {
  const all = getPublishedArticles();
  const featured = all[0];
  const recent = all.slice(1, 7);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {featured ? (
          <section className="mb-10"><HeroArticle article={featured} /></section>
        ) : (
          <section className="mb-10 rounded-xl bg-[#0f1e35] text-white p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Horizon Analysis</h2>
            <p className="text-gray-400 text-sm">No articles published yet. Check back soon.</p>
          </section>
        )}

        {recent.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Latest</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recent.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {sections.map(section => {
            const sectionArticles = getPublishedArticles(section).slice(0, 3);
            if (sectionArticles.length === 0) return null;
            return (
              <section key={section}>
                <div className="flex items-center justify-between mb-3">
                  <SectionBadge section={section} />
                  <Link href={`/${section}`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">View all →</Link>
                </div>
                <div className="space-y-3">
                  {sectionArticles.map(a => (
                    <Link key={a.id} href={`/article/${a.slug}`} className="flex gap-3 group">
                      {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} className="w-20 h-16 object-cover rounded flex-shrink-0" />}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {a.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.author} · {formatDate(a.created_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <NewsletterSignup />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Horizon Analysis. All rights reserved.
      </footer>
    </div>
  );
}
