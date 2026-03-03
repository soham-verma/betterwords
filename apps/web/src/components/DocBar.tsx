import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDistractionFree } from '@/contexts/DistractionFreeContext';

export default function DocBar({ docId, editor }: { docId: string; editor?: any }) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/documents/${docId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setTitle(d.title || 'Untitled'))
      .catch(() => setTitle('Untitled'));
  }, [docId, token]);

  const saveTitle = (newTitle: string) => {
    if (!token || newTitle === title) return;
    setSaved(null);
    fetch(`/api/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newTitle }),
    })
      .then((r) => (r.ok ? setSaved(true) : setSaved(false)))
      .catch(() => setSaved(false));
  };

  const { distractionFree, setDistractionFree } = useDistractionFree();

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={(e) => saveTitle(e.target.value)}
        className="flex-1 min-w-0 bg-transparent border-none text-[var(--text)] font-medium text-lg focus:outline-none focus:ring-0"
        placeholder="Untitled"
      />
      {saved === true && <span className="text-xs text-[var(--text-muted)]">Saved</span>}
      <button
        type="button"
        onClick={() => setDistractionFree(!distractionFree)}
        className="text-sm text-[var(--text-muted)] hover:underline"
      >
        {distractionFree ? 'Show UI' : 'Distraction-free'}
      </button>
      <ExportButton editor={editor} />
      <ShareButton docId={docId} />
    </header>
  );
}

function ExportButton({ editor }: { editor?: any }) {
  const exportJson = () => {
    if (!editor) return;
    const json = editor.getJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <button
      type="button"
      onClick={exportJson}
      disabled={!editor}
      className="text-sm text-[var(--text-muted)] hover:underline disabled:opacity-50"
    >
      Export JSON
    </button>
  );
}

function ShareButton({ docId }: { docId: string }) {
  const [open, setOpen] = useState(false);
  const { token } = useAuth();
  const [perms, setPerms] = useState<{ email: string; role: string }[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('editor');

  useEffect(() => {
    if (!open || !token) return;
    fetch(`/api/documents/${docId}/permissions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setPerms)
      .catch(() => setPerms([]));
  }, [docId, token, open]);

  const copyLink = () => {
    const url = `${window.location.origin}/doc/${docId}`;
    navigator.clipboard.writeText(url);
  };

  const addPermission = () => {
    if (!email || !token) return;
    fetch(`/api/documents/${docId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, role }),
    })
      .then((r) => r.json())
      .then(setPerms)
      .then(() => setEmail(''));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--border)]"
      >
        Share
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-80 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-lg z-20">
            <button onClick={copyLink} className="w-full text-left text-sm text-[var(--accent)] hover:underline mb-2">
              Copy link
            </button>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                onClick={addPermission}
                className="px-2 py-1 rounded bg-[var(--accent)] text-white text-sm"
              >
                Add
              </button>
            </div>
            <ul className="text-sm text-[var(--text-muted)]">
              {perms.map((p) => (
                <li key={p.email}>{p.email} – {p.role}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
