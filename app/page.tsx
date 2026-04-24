export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getPublishedArticles, Article } from '@/lib/db';
import { readingTime } from '@/lib/readingTime';

export const metadata: Metadata = {
  title: 'Horizon Analysis — Making It Simple',
  description: 'In-depth business and economic analysis. Making complex markets simple.',
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const catColor: Record<string, string> = {
  economy:  'text-[#2b6fdb]',
  politics: 'text-[#b94a4a]',
  equities: 'text-[#1f8a5a]',
  others:   'text-[#7b5abf]',
};

const deskBorder: Record<string, string> = {
  economy:  'border-[#2b6fdb]',
  politics: 'border-[#b94a4a]',
  equities: 'border-[#1f8a5a]',
  others:   'border-[#7b5abf]',
};

const deskDot: Record<string, string> = {
  economy:  'bg-[#2b6fdb]',
  politics: 'bg-[#b94a4a]',
  equities: 'bg-[#1f8a5a]',
  others:   'bg-[#7b5abf]',
};

function Hero({ lead, rail }: { lead: Article; rail: Article[] }) {
  const mins = readingTime(lead.content);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-9 mb-16">
      {/* Lead article */}
      <Link href={`/article/${lead.slug}`} className="group relative rounded-sm overflow-hidden bg-navy-900 aspect-[16/11] flex flex-col justify-end cursor-pointer" style={{ boxShadow: '0 18px 40px -24px rgba(15,35,65,0.22)' }}>
        {lead.cover_image_url && (
          <img
            src={lead.cover_image_url}
            alt={lead.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
          />
        )}
        <div className="relative z-10 p-8 sm:p-10" style={{ background: 'linear-gradient(180deg, rgba(15,35,65,0) 30%, rgba(15,35,65,0.58) 60%, rgba(15,35,65,0.94) 100%)' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" style={{ boxShadow: '0 0 8px rgba(179,137,76,0.5)' }} />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gold">The Lead</span>
          </div>
          <h1 className="font-serif font-medium text-white text-3xl sm:text-[42px] leading-[1.08] mb-4 max-w-[92%] group-hover:text-blue-100 transition-colors" style={{ letterSpacing: '-0.015em' }}>
            {lead.title}
          </h1>
          {lead.summary && (
            <p className="font-serif-2 text-white/80 text-[16px] leading-[1.45] mb-4 max-w-[80%] line-clamp-2">{lead.summary}</p>
          )}
          <div className="flex items-center gap-3 text-[12px] text-white/65 font-medium">
            <span className={catColor[lead.section] ?? catColor.others}>{lead.section}</span>
            <span className="text-white/30">·</span>
            <span>{lead.author}</span>
            <span className="text-white/30">·</span>
            <span>{formatDate(lead.created_at)}</span>
            <span className="text-white/30">·</span>
            <span>{mins} min read</span>
          </div>
        </div>
      </Link>

      {/* Rail */}
      <div className="pt-1">
        <div className="flex items-center gap-3 mb-5">
          <span className="font-serif italic text-[15px] text-navy-900 dark:text-gray-300">Also in this issue</span>
          <div className="flex-1 h-px bg-navy-900/20 dark:bg-white/20" />
        </div>
        <div className="divide-y divide-[rgba(15,35,65,0.1)] dark:divide-white/10">
          {rail.map((a, i) => (
            <Link key={a.id} href={`/article/${a.slug}`} className="group grid grid-cols-[36px_1fr] gap-3 py-5 hover:translate-x-0.5 transition-transform">
              <span className="font-serif italic text-[22px] text-gold leading-none font-normal pt-0.5">{i + 1}</span>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${catColor[a.section] ?? catColor.others}`}>{a.section}</div>
                <h3 className="font-serif font-medium text-[17px] leading-[1.25] text-ink dark:text-gray-100 mb-2 group-hover:text-navy-700 dark:group-hover:text-blue-400 transition-colors">{a.title}</h3>
                <div className="text-[11.5px] text-[#6a7990] dark:text-gray-400">{a.author} · {formatDate(a.created_at)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const DESKS = ['economy', 'politics', 'equities'] as const;

export default async function HomePage() {
  const all = await getPublishedArticles();
  if (all.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] dark:bg-gray-900">
        <Header />
        <main className="max-w-[1320px] mx-auto px-6 lg:px-10 py-16 text-center">
          <h2 className="font-serif text-3xl text-navy-900 dark:text-gray-100 mb-3">Welcome to Horizon Analysis</h2>
          <p className="text-[#6a7990] dark:text-gray-400">No articles published yet. Check back soon.</p>
        </main>
      </div>
    );
  }

  const [lead, ...rest] = all;
  const rail = rest.slice(0, 4);
  const latest = rest.slice(0, 3);
  const deskData = DESKS.map(s => ({ section: s, articles: all.filter(a => a.section === s) })).filter(d => d.articles.length > 0);

  return (
    <div className="min-h-screen bg-[#fbfaf7] dark:bg-gray-900">
      <Header />
      <main className="max-w-[1320px] mx-auto px-6 lg:px-10 py-9">

        {/* Hero */}
        <Hero lead={lead} rail={rail} />

        {/* Latest */}
        {latest.length > 0 && (
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-7 pb-3.5 border-b border-ink dark:border-white/20">
              <h2 className="font-serif font-medium text-[26px] text-ink dark:text-gray-100" style={{ letterSpacing: '-0.01em' }}>Latest</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {latest.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}

        {/* Section desks */}
        {deskData.length > 0 && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deskData.map(({ section, articles }) => {
                const [deskLead, ...deskRest] = articles;
                return (
                  <div key={section} className={`border-t-2 pt-5 ${deskBorder[section]}`}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <span className={`w-[7px] h-[7px] ${deskDot[section]}`} />
                      <span className="flex-1 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink dark:text-gray-100">{section}</span>
                      <Link href={`/${section}`} className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#6a7990] hover:text-navy-700 transition-colors">
                        All →
                      </Link>
                    </div>
                    <Link href={`/article/${deskLead.slug}`} className="group block font-serif font-medium text-[21px] leading-[1.18] text-ink dark:text-gray-100 mb-4 hover:text-navy-700 dark:hover:text-blue-400 transition-colors" style={{ letterSpacing: '-0.005em' }}>
                      {deskLead.title}
                    </Link>
                    {deskRest.length > 0 && (
                      <ul className="space-y-0">
                        {deskRest.slice(0, 3).map(a => (
                          <li key={a.id} className="border-t border-[rgba(15,35,65,0.1)] dark:border-white/10">
                            <Link href={`/article/${a.slug}`} className="block py-2.5 text-[14px] font-medium text-[#2a3648] dark:text-gray-300 hover:text-navy-700 dark:hover:text-blue-400 transition-colors leading-snug">
                              {a.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Newsletter */}
        <div className="mb-16">
          <NewsletterSignup />
        </div>
      </main>

      <footer className="border-t border-[rgba(15,35,65,0.12)] dark:border-white/10 py-7 px-10 max-w-[1320px] mx-auto flex items-center justify-between text-[12.5px] text-[#6a7990] dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink dark:text-gray-200">Horizon Analysis</span>
          <span className="text-[#9aa6b8]">·</span>
          <span>Making It Simple</span>
        </div>
        <span>© {new Date().getFullYear()} Horizon Analysis</span>
      </footer>
    </div>
  );
}
