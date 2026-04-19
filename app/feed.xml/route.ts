import { getPublishedArticles } from '@/lib/db';

export const dynamic = 'force-dynamic';

function escape(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(req: Request) {
  const baseUrl = new URL(req.url).origin;
  const articles = await getPublishedArticles();

  const items = articles.map(a => `
    <item>
      <title>${escape(a.title)}</title>
      <link>${baseUrl}/article/${a.slug}</link>
      <description>${escape(a.summary ?? '')}</description>
      <author>${escape(a.author)}</author>
      <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>
      <category>${escape(a.section)}</category>
      <guid>${baseUrl}/article/${a.slug}</guid>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Horizon Analysis</title>
    <link>${baseUrl}</link>
    <description>In-depth business and economic analysis — Making It Simple</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
