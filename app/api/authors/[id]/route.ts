import { NextRequest, NextResponse } from 'next/server';
import { getAuthorById, updateAuthor, deleteAuthor } from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const author = await getAuthorById(Number(params.id));
  if (!author) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(author);
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { name, bio, avatar_url } = await req.json();
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    const author = await updateAuthor(Number(params.id), updates as any);
    if (!author) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(author);
  } catch {
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const existing = await getAuthorById(Number(params.id));
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteAuthor(Number(params.id));
  return NextResponse.json({ success: true });
}
