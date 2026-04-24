import { NextResponse } from 'next/server';

const SYMBOLS = [
  { symbol: 'SPY',    label: 'S&P 500'   },
  { symbol: 'BTCUSD', label: 'Bitcoin'   },
  { symbol: 'ETHUSD', label: 'Ethereum'  },
  { symbol: 'EURUSD', label: 'EUR / USD' },
  { symbol: 'NVDA',   label: 'Nvidia'    },
  { symbol: 'AAPL',   label: 'Apple'     },
  { symbol: 'MSFT',   label: 'Microsoft' },
];

let cache: { data: unknown; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 5 * 60 * 1000) {
    return NextResponse.json(cache.data);
  }

  try {
    const key = process.env.FMP_API_KEY;
    const results = await Promise.all(
      SYMBOLS.map(({ symbol, label }) =>
        fetch(`https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${key}`, { next: { revalidate: 300 } })
          .then(r => r.json())
          .then((json: any[]) => {
            if (!Array.isArray(json) || !json[0]?.price) return null;
            const q = json[0];
            const pct = q.changePercentage ?? 0;
            return {
              label,
              val: formatVal(symbol, q.price),
              chg: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
              up: pct >= 0,
            };
          })
          .catch(() => null)
      )
    );

    const data = results.filter(Boolean);
    if (data.length) cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

function formatVal(symbol: string, price: number): string {
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') return `$${Math.round(price).toLocaleString()}`;
  if (symbol === 'EURUSD') return price.toFixed(4);
  return `$${price.toFixed(2)}`;
}
