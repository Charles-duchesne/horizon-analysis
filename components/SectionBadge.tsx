const sectionStyles: Record<string, string> = {
  economy:  'text-[#2b6fdb]',
  politics: 'text-[#b94a4a]',
  equities: 'text-[#1f8a5a]',
  others:   'text-[#7b5abf]',
};

export default function SectionBadge({ section }: { section: string }) {
  const styles = sectionStyles[section] ?? sectionStyles.others;
  return (
    <span className={`inline-block text-[10.5px] font-bold uppercase tracking-[0.18em] ${styles}`}>
      {section}
    </span>
  );
}
