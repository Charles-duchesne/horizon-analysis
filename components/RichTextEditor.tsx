'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect, useRef, useState } from 'react';

type Props = { value: string; onChange: (val: string) => void };

function Btn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`px-2 py-1 rounded text-sm transition-colors ${active ? 'bg-[#0f1e35] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-300 mx-1" />;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [showImgUrl, setShowImgUrl] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none min-h-[360px] px-5 py-4 focus:outline-none prose-strong:font-bold',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value (edit mode initial load)
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function insertImgUrl() {
    if (imgUrl && editor) {
      editor.chain().focus().setImage({ src: imgUrl }).run();
      setImgUrl('');
      setShowImgUrl(false);
    }
  }

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><strong>B</strong></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em>I</em></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><span className="underline">U</span></Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">≡</Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1.</Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">"</Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">{`</>`}</Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">⬛</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">≡</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">≡</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">⬛</Btn>

        <Sep />

        <Btn onClick={() => setShowImgUrl(v => !v)} active={showImgUrl} title="Insert image from URL">🖼 URL</Btn>
        <Btn onClick={() => fileInputRef.current?.click()} active={false} title="Upload image">{uploading ? '…' : '🖼 Upload'}</Btn>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        <Sep />

        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule">—</Btn>
        <Btn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</Btn>
      </div>

      {/* URL insert row */}
      {showImgUrl && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-blue-50">
          <input
            type="url"
            value={imgUrl}
            onChange={e => setImgUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); insertImgUrl(); } }}
          />
          <button type="button" onClick={insertImgUrl} className="bg-[#0f1e35] text-white px-3 py-1 rounded text-sm">Insert</button>
          <button type="button" onClick={() => setShowImgUrl(false)} className="text-gray-400 text-sm">✕</button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
