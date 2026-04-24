'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage("You're subscribed. Thank you!");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <section className="relative bg-navy-900 text-white rounded-sm px-10 py-12 overflow-hidden">
      {/* Gold glow */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(179,137,76,0.2)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold mb-3">Newsletter</p>
          <h3 className="font-serif font-medium text-[26px] leading-[1.2] mb-3" style={{ letterSpacing: '-0.01em' }}>
            Stay ahead of the markets
          </h3>
          <p className="text-[14px] text-white/70 leading-relaxed">
            In-depth analysis on economics, politics, and markets — delivered to your inbox.
          </p>
        </div>

        <div>
          {status === 'success' ? (
            <p className="text-emerald-400 font-medium text-sm">{message}</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-sm px-3.5 py-1 gap-2 text-ink">
                <Mail size={15} className="text-[#6a7990] flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="flex-1 py-3 text-[14px] bg-transparent border-0 outline-none placeholder-[#9aa6b8]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-navy-900 text-white px-4 py-2 rounded-sm text-[13px] font-semibold tracking-wide hover:bg-navy-800 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
              {status === 'error' && <p className="text-red-400 text-xs mt-2">{message}</p>}
              <p className="text-[11.5px] text-white/40 text-center mt-4">No spam. Unsubscribe at any time.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
