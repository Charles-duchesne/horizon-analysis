import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    addSubscriber(email.toLowerCase().trim());
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
