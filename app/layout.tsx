import type { Metadata } from 'next';
import { Inter, Playfair_Display, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', style: ['normal', 'italic'], weight: ['400', '500', '600', '700'] });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif-2', style: ['normal', 'italic'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'Horizon Analysis',
  description: 'In-depth business and economic analysis — Making It Simple',
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="Horizon Analysis RSS Feed" href="/feed.xml" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${sourceSerif.variable} font-sans bg-[#fbfaf7] dark:bg-gray-900 text-[#0c1626] dark:text-gray-100 antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
