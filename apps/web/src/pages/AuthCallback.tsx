import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    if (error) {
      navigate('/login', { replace: true });
      return;
    }
    if (token) {
      setToken(token);
      navigate('/', { replace: true });
    }
  }, [searchParams, setToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <p className="text-[var(--text-muted)]">Signing you in...</p>
    </div>
  );
}
