const sectionStyles: Record<string, string> = {
  economy: 'bg-blue-100 text-blue-800 border-blue-200',
  politics: 'bg-red-100 text-red-800 border-red-200',
  equities: 'bg-green-100 text-green-800 border-green-200',
  others: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function SectionBadge({ section }: { section: string }) {
  const styles = sectionStyles[section] ?? sectionStyles.others;
  return (
    <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${styles}`}>
      {section}
    </span>
  );
}
