import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type Doc = { id: string; title: string };

export default function SidebarDocList() {
  const { token } = useAuth();
  const { id: currentId } = useParams();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const text = await r.text();
        return text ? JSON.parse(text) : [];
      })
      .then(setDocs)
      .catch(() => setDocs([]));
  }, [token]);

  const createDoc = () => {
    if (!token || creating) return;
    setCreating(true);
    fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Untitled' }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const text = await r.text();
        return text ? JSON.parse(text) : {};
      })
      .then((doc) => {
        if (doc?.id) window.location.href = `/doc/${doc.id}`;
      })
      .catch(() => {})
      .finally(() => setCreating(false));
  };

  return (
    <>
      <button
        onClick={createDoc}
        disabled={creating}
        className="w-full text-left px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium mb-2"
      >
        {creating ? 'Creating…' : '+ New document'}
      </button>
      <ul className="space-y-0.5">
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link
              to={`/doc/${doc.id}`}
              className={`block px-3 py-2 rounded-lg text-sm truncate ${
                currentId === doc.id ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--border)] text-[var(--text)]'
              }`}
            >
              {doc.title || 'Untitled'}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
