'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem('horizon_admin');
    router.push('/admin');
  }

  const links = [
    { href: '/admin/dashboard', label: 'Articles' },
    { href: '/admin/new', label: '+ New' },
    { href: '/admin/authors', label: 'Authors' },
    { href: '/admin/tags', label: 'Tags' },
  ];

  return (
    <nav className="bg-[#0f1e35] text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-4 overflow-x-auto">
      <div className="flex items-center gap-5 flex-shrink-0">
        <span className="font-bold text-sm text-blue-400 uppercase tracking-widest">Admin</span>
        {links.map(({ href, label }) => (
          <Link key={href} href={href}
            className={`text-sm whitespace-nowrap transition-colors hover:text-blue-300 ${pathname === href || pathname.startsWith(href + '/') ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">← Site</Link>
        <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 transition-colors">Logout</button>
      </div>
    </nav>
  );
}
