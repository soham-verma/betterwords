import React, { createContext, useContext, useState, useEffect } from 'react';

const TOKEN_KEY = 'betterwords_token';

type User = { id: string; email: string; name?: string; picture?: string } | null;

const AuthContext = createContext<{
  user: User;
  token: string | null;
  login: () => void;
  logout: () => void;
  setToken: (t: string | null) => void;
}>(null as any);

const DEMO_USER: User = { id: 'demo-user', email: 'demo@test.com', name: 'Demo User', picture: '' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY) || 'demo');
  const [user, setUser] = useState<User>(() => {
    const t = localStorage.getItem(TOKEN_KEY) || 'demo';
    return t === 'demo' ? DEMO_USER : null;
  });

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    // Demo mode: skip /me fetch, use demo user
    if (token === 'demo') {
      setUser(DEMO_USER);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser({ id: data.sub || data.id, email: data.email, name: data.name, picture: data.picture }))
      .catch(() => {
        setTokenState(null);
        setUser(null);
      });
  }, [token]);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    setTokenState(t);
  };

  const login = () => {
    // Auth disabled for demo - Google OAuth commented out
    // window.location.href = '/api/auth/google';
    setToken('demo');
    setUser(DEMO_USER);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
