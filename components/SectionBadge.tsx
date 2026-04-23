const sectionStyles: Record<string, string> = {
  economy: 'text-blue-700',
  politics: 'text-red-700',
  equities: 'text-green-700',
  others: 'text-gray-500',
};

export default function SectionBadge({ section }: { section: string }) {
  const styles = sectionStyles[section] ?? sectionStyles.others;
  return (
    <span className={`inline-block text-xs font-semibold uppercase tracking-wider ${styles}`}>
      {section}
    </span>
  );
}
