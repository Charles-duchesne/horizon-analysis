import Link from 'next/link';
import SectionBadge from './SectionBadge';
import { Article } from '@/lib/db';
import { readingTime } from '@/lib/readingTime';

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ArticleCard({ article }: { article: Article }) {
  const mins = readingTime(article.content);
  return (
    <Link href={`/article/${article.slug}`} className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {article.cover_image_url && (
        <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-2">
          <SectionBadge section={article.section} />
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors mb-1 line-clamp-2">
          {article.title}
        </h2>
        {article.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{article.summary}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{article.author}</span>
          <span className="flex items-center gap-2">
            <span>{mins} min read</span>
            <span>·</span>
            <span>{formatDate(article.created_at)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
