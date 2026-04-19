import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle, generateSlug, getAuthorById, setArticleTags } from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const article = await getArticleById(Number(params.id));
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const { title, section, author_id, summary, content, cover_image_url, published, publish_at, tags } = body;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) { updates.title = title; updates.slug = generateSlug(title); }
    if (section !== undefined) updates.section = section;
    if (author_id !== undefined) {
      updates.author_id = author_id ? Number(author_id) : null;
      if (author_id) {
        const author = await getAuthorById(Number(author_id));
        if (author) updates.author = author.name;
      }
    }
    if (summary !== undefined) updates.summary = summary;
    if (content !== undefined) updates.content = content;
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;
    if (published !== undefined) updates.published = published ? 1 : 0;
    if (publish_at !== undefined) updates.publish_at = publish_at || null;

    const article = await updateArticle(Number(params.id), updates);
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (tags !== undefined) await setArticleTags(Number(params.id), tags);

    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    if (!(await getArticleById(Number(params.id)))) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await deleteArticle(Number(params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
