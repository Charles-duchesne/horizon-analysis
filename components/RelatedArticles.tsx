import Link from 'next/link';
import SectionBadge from './SectionBadge';
import { Article } from '@/lib/db';

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function RelatedArticles({ articles, section }: { articles: Article[]; section: string }) {
  if (articles.length === 0) return null;

  const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">More from {sectionLabel}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {articles.map(a => (
          <Link key={a.id} href={`/article/${a.slug}`} className="group block bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
            {a.cover_image_url && (
              <img src={a.cover_image_url} alt={a.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
            )}
            <div className="p-3">
              <SectionBadge section={a.section} />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {a.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.author} · {formatDate(a.created_at)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
