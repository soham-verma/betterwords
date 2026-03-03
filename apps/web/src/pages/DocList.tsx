import { Link } from 'react-router-dom';

export default function DocList() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Your documents</h2>
      <p className="text-[var(--text-muted)] mb-6">Select a document from the sidebar or create a new one.</p>
      <Link to="/" className="text-[var(--accent)] hover:underline">Go to sidebar →</Link>
    </div>
  );
}
