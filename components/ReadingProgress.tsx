'use client';

import { useEffect, useState } from 'react';

const sectionColors: Record<string, string> = {
  economy: '#3b82f6',
  politics: '#ef4444',
  equities: '#22c55e',
  others: '#6b7280',
};

export default function ReadingProgress({ section }: { section: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div
        className="h-full transition-all duration-75"
        style={{ width: `${progress}%`, backgroundColor: sectionColors[section] ?? sectionColors.others }}
      />
    </div>
  );
}
