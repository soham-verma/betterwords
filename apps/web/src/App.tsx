import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DistractionFreeProvider } from '@/contexts/DistractionFreeContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import DocList from '@/pages/DocList';
import DocPage from '@/pages/DocPage';

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/"
        element={
          <Protected>
            <DistractionFreeProvider>
              <Layout />
            </DistractionFreeProvider>
          </Protected>
        }
      >
        <Route index element={<DocList />} />
        <Route path="doc/:id" element={<DocPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
