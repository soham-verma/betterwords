import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDistractionFree } from '@/contexts/DistractionFreeContext';
import SidebarDocList from './SidebarDocList';

export default function Layout() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const { distractionFree } = useDistractionFree();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showSidebar = !distractionFree && sidebarOpen;

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      {!distractionFree && (
      <>
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="md:hidden fixed top-2 left-2 z-20 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? '←' : '☰'}
      </button>
      <aside className={`w-64 border-r border-[var(--border)] flex flex-col bg-[var(--bg-secondary)] transition-transform md:transform-none ${showSidebar ? 'transform-none' : '-translate-x-full'} absolute md:relative inset-y-0 left-0 z-10`}>
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-semibold text-[var(--text)]">BetterWords</span>
        </div>
        <nav className="flex-1 p-2 overflow-auto">
          <SidebarDocList />
        </nav>
        <div className="p-2 border-t border-[var(--border)] flex items-center gap-2">
          {user?.picture && (
            <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
          )}
          <span className="text-sm text-[var(--text-muted)] truncate flex-1">{user?.email}</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--text-muted)]"
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={logout} className="text-sm text-[var(--text-muted)] hover:underline">
            Log out
          </button>
        </div>
      </aside>
      </>
      )}
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
