import { useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';

const wsUrl = () => {
  const u = new URL(window.location.href);
  const protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${u.host}/ws`;
};

function useYDocSync(docId: string, token: string, ydoc: Y.Doc) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ doc: docId, token });
    const ws = new WebSocket(`${wsUrl()}?${params}`);
    ws.binaryType = 'arraybuffer';

    ws.onmessage = (ev) => {
      const data = ev.data;
      if (data instanceof ArrayBuffer && data.byteLength > 0) {
        try {
          Y.applyUpdate(ydoc, new Uint8Array(data));
        } catch (e) {
          console.error('Y applyUpdate', e);
        }
      }
    };

    const updateHandler = (update: Uint8Array) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(update);
    };
    ydoc.on('update', updateHandler);

    wsRef.current = ws;
    return () => {
      ydoc.off('update', updateHandler);
      ws.close();
      wsRef.current = null;
    };
  }, [docId, token, ydoc]);
}

export default function Editor({
  docId,
  token,
  onEditorReady,
}: {
  docId: string;
  token: string;
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
}) {
  const ydoc = useMemo(() => new Y.Doc(), []);
  useYDocSync(docId, token, ydoc);

  const editor = useEditor({
    extensions: [
      Document.extend({ content: 'block+' }),
      Text,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      Collaboration.configure({ document: ydoc }),
    ],
    editorProps: {
      attributes: { class: 'prose-editor min-h-full px-6 py-4 max-w-3xl mx-auto focus:outline-none' },
    },
  });

  useEffect(() => () => editor?.destroy(), [editor]);
  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  if (!editor) return <div className="p-4 text-[var(--text-muted)]">Loading editor…</div>;

  return (
    <div className="h-full">
      <FormattingToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function FormattingToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <select
        className="rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-2 py-1"
        value={editor.getAttributes('heading').level || 0}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: v as 1 | 2 | 3 | 4 }).run();
        }}
      >
        <option value={0}>Paragraph</option>
        <option value={1}>Heading 1</option>
        <option value={2}>Heading 2</option>
        <option value={3}>Heading 3</option>
        <option value={4}>Heading 4</option>
      </select>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-[var(--border)]' : ''}`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-[var(--border)]' : ''}`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('underline') ? 'bg-[var(--border)]' : ''}`}
      >
        Underline
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 rounded text-sm">
        List
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-2 py-1 rounded text-sm">
        Numbered
      </button>
      <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="px-2 py-1 rounded text-sm">
        Table
      </button>
      <button type="button" onClick={addImage} className="px-2 py-1 rounded text-sm">
        Image
      </button>
    </div>
  );
}
