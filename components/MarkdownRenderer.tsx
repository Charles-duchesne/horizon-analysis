'use client';

import ReactMarkdown from 'react-markdown';

const PROSE = 'prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:font-bold prose-strong:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-blue-400 prose-blockquote:text-gray-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:mx-auto';

export default function MarkdownRenderer({ content }: { content: string }) {
  const isHtml = content.trimStart().startsWith('<');

  if (isHtml) {
    return (
      <div
        className={PROSE}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={PROSE}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
