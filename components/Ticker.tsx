'use client';

import { useEffect, useState } from 'react';

type TickerItem = { label: string; val: string; chg: string; up: boolean };

const FALLBACK: TickerItem[] = [
  { label: 'S&P 500', val: '—', chg: '—', up: true },
  { label: 'NASDAQ',  val: '—', chg: '—', up: true },
  { label: 'Gold',    val: '—', chg: '—', up: true },
  { label: 'Bitcoin', val: '—', chg: '—', up: true },
];

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK);

  useEffect(() => {
    fetch('/api/market-data')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setItems(data); })
      .catch(() => {});
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="bg-[#173258] text-white h-9 flex items-center overflow-hidden border-b border-white/5 text-[11px] font-mono">
      <div className="flex items-center gap-2 px-4 border-r border-white/10 h-full flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse" />
        <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-white/70">Markets</span>
      </div>

      <div className="flex-1 overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)' }}>
        <div className="flex gap-9 items-center h-9 px-6 whitespace-nowrap animate-[ticker_50s_linear_infinite]">
          {doubled.map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-white/50 text-[10.5px] uppercase tracking-wider">{t.label}</span>
              <span className="text-white font-medium">{t.val}</span>
              <span className={`text-[10.5px] ${t.chg === '—' ? 'text-white/30' : t.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.chg !== '—' && (t.up ? '▲' : '▼')} {t.chg}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 border-l border-white/10 h-full flex items-center flex-shrink-0 text-[10px] text-white/40 tracking-wider uppercase font-sans">
        Live
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
