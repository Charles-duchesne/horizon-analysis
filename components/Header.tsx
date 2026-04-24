'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Search, X } from 'lucide-react';
import Ticker from './Ticker';

const navLinks = [
  { href: '/economy', label: 'Economy' },
  { href: '/politics', label: 'Politics' },
  { href: '/equities', label: 'Equities' },
  { href: '/others', label: 'Others' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <header className={`sticky top-0 z-40 transition-shadow ${scrolled ? 'shadow-lg' : ''}`}>
      {/* Main nav bar */}
      <div className="bg-navy-900 text-white border-b border-white/8">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8 md:gap-12 h-[60px]">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <Image src="/logo.png" alt="Horizon Analysis" width={40} height={40} className="rounded-full" priority />
              <div className="leading-tight">
                <div className="font-sans font-bold text-[15px] tracking-tight text-white">
                  Horizon <span className="text-[#8ca7c6] font-medium">Analysis</span>
                </div>
                <div className="text-[10px] tracking-[0.12em] uppercase text-white/50 mt-0.5">Making It Simple</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center justify-center gap-8">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}
                  className={`relative text-[13.5px] font-medium py-2 transition-colors hover:text-white ${
                    pathname === href
                      ? 'text-white after:absolute after:left-0 after:right-0 after:bottom-[-2px] after:h-[2px] after:bg-[#8ca7c6]'
                      : 'text-white/75'
                  }`}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Tools */}
            <div className="flex items-center gap-1">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                    className="bg-white/10 text-white placeholder-white/40 text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-white/30 w-44"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-white/60 hover:text-white">
                    <X size={15} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white/70 hover:bg-white/8 hover:text-white transition-colors">
                  <Search size={16} />
                </button>
              )}
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white/70 hover:bg-white/8 hover:text-white transition-colors"
                >
                  {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-5 pb-2 overflow-x-auto">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`text-xs font-medium whitespace-nowrap ${pathname === href ? 'text-white' : 'text-white/60'}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Markets ticker */}
      <Ticker />
    </header>
  );
}
