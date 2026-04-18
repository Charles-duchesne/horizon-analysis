import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, createArticle, generateSlug, getAuthorById, setArticleTags } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json(getAllArticles());
  } catch {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, section, author_id, summary, content, cover_image_url, published, publish_at, tags } = body;

    if (!title || !section || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let authorName = 'Unknown';
    if (author_id) {
      const author = getAuthorById(Number(author_id));
      if (author) authorName = author.name;
    }

    const article = createArticle({
      title,
      slug: generateSlug(title),
      section,
      author: authorName,
      author_id: author_id ? Number(author_id) : null,
      summary: summary || null,
      content,
      cover_image_url: cover_image_url || null,
      published: published ? 1 : 0,
      publish_at: publish_at || null,
    });

    if (tags?.length) setArticleTags(article.id, tags);

    return NextResponse.json(article, { status: 201 });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'An article with this title already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
