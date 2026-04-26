import { NextRequest, NextResponse } from 'next/server';

const ALLOWED = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    if (!ALLOWED.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`uploads/${filename}`, file, { access: 'public' });
      return NextResponse.json({ url: blob.url });
    }

    // Local fallback: save to public/uploads
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });

  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
