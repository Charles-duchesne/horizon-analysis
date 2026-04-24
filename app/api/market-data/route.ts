import { NextResponse } from 'next/server';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD', 'BTCUSD', 'ETHUSD'];

const LABELS: Record<string, string> = {
  SPY:    'S&P 500',
  QQQ:    'NASDAQ',
  DIA:    'Dow Jones',
  GLD:    'Gold',
  BTCUSD: 'Bitcoin',
  ETHUSD: 'Ethereum',
};

// Cache for 5 minutes
let cache: { data: unknown; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 5 * 60 * 1000) {
    return NextResponse.json(cache.data);
  }

  try {
    const key = process.env.FMP_API_KEY;
    const url = `https://financialmodelingprep.com/api/v3/quote/${SYMBOLS.join(',')}?apikey=${key}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const json = await res.json();

    if (!Array.isArray(json)) throw new Error('Invalid response');

    const data = json.map((q: any) => ({
      label: LABELS[q.symbol] ?? q.symbol,
      val:   formatVal(q.symbol, q.price),
      chg:   `${q.changesPercentage >= 0 ? '+' : ''}${q.changesPercentage.toFixed(2)}%`,
      up:    q.changesPercentage >= 0,
    }));

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

function formatVal(symbol: string, price: number): string {
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') {
    return `$${Math.round(price).toLocaleString()}`;
  }
  return `$${price.toFixed(2)}`;
}
