import Link from 'next/link';
import { Article } from '@/lib/db';
import { readingTime } from '@/lib/readingTime';

const catColor: Record<string, string> = {
  economy:  'text-[#2b6fdb]',
  politics: 'text-[#b94a4a]',
  equities: 'text-[#1f8a5a]',
  others:   'text-[#7b5abf]',
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ArticleCard({ article }: { article: Article }) {
  const mins = readingTime(article.content);
  return (
    <Link href={`/article/${article.slug}`} className="group block cursor-pointer">
      {article.cover_image_url && (
        <div className="aspect-[4/3] rounded-sm mb-4 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className={`text-[10.5px] font-bold uppercase tracking-[0.18em] mb-2.5 ${catColor[article.section] ?? catColor.others}`}>
        {article.section}
      </div>
      <h3 className="font-serif font-medium text-[19px] leading-[1.22] text-ink dark:text-gray-100 mb-3 group-hover:text-navy-700 dark:group-hover:text-blue-400 transition-colors line-clamp-3" style={{ letterSpacing: '-0.005em' }}>
        {article.title}
      </h3>
      <div className="flex gap-3 text-[11.5px] text-[#6a7990] dark:text-gray-400">
        <span>{article.author}</span>
        <span>·</span>
        <span>{formatDate(article.created_at)}</span>
        <span>·</span>
        <span>{mins} min</span>
      </div>
    </Link>
  );
}
