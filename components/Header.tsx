'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Search, X } from 'lucide-react';

const navLinks = [
  { href: '/economy', label: 'Economy' },
  { href: '/politics', label: 'Politics' },
  { href: '/equities', label: 'Equities' },
  { href: '/others', label: 'Others' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
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
    <header className={`sticky top-0 z-40 bg-[#1a3a5c] text-white transition-shadow ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image src="/logo.png" alt="Horizon Analysis logo" width={48} height={48} className="rounded-full" priority />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight text-white">
                Horizon <span className="text-blue-400">Analysis</span>
              </span>
              <span className="text-xs text-gray-400 tracking-wide">Making It Simple</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`text-sm font-medium transition-colors hover:text-blue-300 ${pathname === href ? 'text-blue-400 border-b-2 border-blue-400 pb-0.5' : 'text-gray-300'}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search articles..."
                  autoFocus
                  className="bg-white/10 text-white placeholder-gray-400 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-300 hover:text-white transition-colors" title="Search">
                <Search size={18} />
              </button>
            )}

            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Toggle dark mode"
              >
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-4 pb-2 overflow-x-auto">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`text-xs font-medium whitespace-nowrap transition-colors hover:text-blue-300 ${pathname === href ? 'text-blue-400' : 'text-gray-300'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
