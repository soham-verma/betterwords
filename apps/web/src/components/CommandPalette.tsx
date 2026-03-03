import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type Command = { id: string; label: string; run: () => void };

export function useCommandPalette(editor: any, _docId?: string) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const commands: Command[] = [
    { id: 'h1', label: 'Heading 1', run: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: 'h2', label: 'Heading 2', run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: 'h3', label: 'Heading 3', run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { id: 'h4', label: 'Heading 4', run: () => editor?.chain().focus().toggleHeading({ level: 4 }).run() },
    { id: 'p', label: 'Paragraph', run: () => editor?.chain().focus().setParagraph().run() },
    { id: 'bold', label: 'Toggle bold', run: () => editor?.chain().focus().toggleBold().run() },
    { id: 'italic', label: 'Toggle italic', run: () => editor?.chain().focus().toggleItalic().run() },
    { id: 'underline', label: 'Toggle underline', run: () => editor?.chain().focus().toggleUnderline().run() },
    { id: 'bullet', label: 'Bullet list', run: () => editor?.chain().focus().toggleBulletList().run() },
    { id: 'ordered', label: 'Numbered list', run: () => editor?.chain().focus().toggleOrderedList().run() },
    { id: 'table', label: 'Insert table', run: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { id: 'image', label: 'Insert image', run: () => { const u = window.prompt('Image URL'); if (u) editor?.chain().focus().setImage({ src: u }).run(); } },
    { id: 'new', label: 'New document', run: () => navigate('/') },
    { id: 'share', label: 'Share', run: () => {} },
  ];

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { open, setOpen, commands, toggle };
}

export function CommandPaletteModal({
  open,
  onClose,
  commands,
  onRun,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
  onRun: (c: Command) => void;
}) {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(0);
  const filtered = commands.filter((c) => c.label.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    setSelected(0);
  }, [filter]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, filtered.length - 1));
      if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0));
      if (e.key === 'Enter' && filtered[selected]) {
        onRun(filtered[selected]);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, selected, onClose, onRun]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search commands…"
          className="w-full px-4 py-3 bg-transparent border-none text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none"
          autoFocus
        />
        <ul className="max-h-72 overflow-auto py-2">
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => { onRun(c); onClose(); }}
                className={`w-full text-left px-4 py-2 text-sm ${i === selected ? 'bg-[var(--accent)] text-white' : 'text-[var(--text)]'}`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
