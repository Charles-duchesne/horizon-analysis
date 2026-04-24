'use client';

const TICKERS = [
  { label: 'S&P 500', val: '5,412', chg: '+0.42%', up: true },
  { label: 'NASDAQ', val: '17,204', chg: '+0.88%', up: true },
  { label: '10Y UST', val: '4.21%', chg: '-3 bps', up: false },
  { label: 'DXY', val: '103.14', chg: '+0.11%', up: true },
  { label: 'Brent', val: '$84.20', chg: '-0.72%', up: false },
  { label: 'Gold', val: '$2,341', chg: '+0.33%', up: true },
  { label: 'BTC', val: '$71,820', chg: '+2.14%', up: true },
  { label: 'EUR/USD', val: '1.0812', chg: '-0.09%', up: false },
  { label: 'USD/JPY', val: '152.08', chg: '+0.24%', up: true },
];

const items = [...TICKERS, ...TICKERS];

export default function Ticker() {
  return (
    <div className="bg-[#173258] text-white h-9 flex items-center overflow-hidden border-b border-white/5 text-[11px] font-mono">
      {/* Live label */}
      <div className="flex items-center gap-2 px-4 border-r border-white/10 h-full flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse" />
        <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-white/70">Markets</span>
      </div>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)' }}>
        <div className="flex gap-9 items-center h-9 px-6 whitespace-nowrap animate-[ticker_60s_linear_infinite]">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-white/50 text-[10.5px] uppercase tracking-wider">{t.label}</span>
              <span className="text-white font-medium">{t.val}</span>
              <span className={`text-[10.5px] ${t.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.up ? '▲' : '▼'} {t.chg}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="px-4 border-l border-white/10 h-full flex items-center flex-shrink-0 text-[10px] text-white/40 tracking-wider uppercase font-sans">
        Indicative
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
