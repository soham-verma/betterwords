import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)]">
      <h1 className="text-3xl font-bold text-[var(--text)] mb-2">BetterWords</h1>
      <p className="text-[var(--text-muted)] mb-8">Word, rebuilt for 2026.</p>
      <button
        onClick={login}
        className="px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90"
      >
        Continue as Demo
      </button>
      {/* Google OAuth disabled for testing: <button onClick={() => window.location.href='/api/auth/google'}>Sign in with Google</button> */}
    </div>
  );
}
