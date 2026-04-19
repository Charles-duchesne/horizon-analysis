import { NextRequest, NextResponse } from 'next/server';
import { getAllAuthors, createAuthor } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await getAllAuthors());
}

export async function POST(req: NextRequest) {
  try {
    const { name, bio, avatar_url } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const author = await createAuthor({ name: name.trim(), bio: bio || null, avatar_url: avatar_url || null });
    return NextResponse.json(author, { status: 201 });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Author with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}
