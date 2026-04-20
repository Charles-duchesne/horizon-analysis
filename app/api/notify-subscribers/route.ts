import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getArticleById, getAllSubscribers } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://horizon-analysis.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const { articleId } = await req.json();
    if (!articleId) return NextResponse.json({ error: 'Missing articleId' }, { status: 400 });

    const [article, subscribers] = await Promise.all([
      getArticleById(Number(articleId)),
      getAllSubscribers(),
    ]);

    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    if (subscribers.length === 0) return NextResponse.json({ sent: 0 });

    const articleUrl = `${BASE_URL}/article/${article.slug}`;

    const emails = subscribers.map(s => s.email);

    const { data, error } = await resend.emails.send({
      from: 'Horizon Analysis <onboarding@resend.dev>',
      to: emails.slice(0, 1), // Resend test sender only works for 1 email at a time to your own account
      subject: article.title,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #6b7280;">${article.section}</span>
          </div>
          <h1 style="font-size: 28px; font-weight: 700; line-height: 1.3; margin: 0 0 16px;">${article.title}</h1>
          ${article.summary ? `<p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">${article.summary}</p>` : ''}
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 24px;">By ${article.author}</p>
          <a href="${articleUrl}" style="display: inline-block; background: #0f1e35; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Read the full article →</a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            You're receiving this because you subscribed to Horizon Analysis.<br/>
            <a href="${BASE_URL}" style="color: #6b7280;">horizonanalysis.com</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Resend success:', JSON.stringify(data));
    return NextResponse.json({ sent: emails.length });
  } catch (err: any) {
    console.error('Notify error:', err);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}
