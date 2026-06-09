import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading, onboardingDone } = useAuth();

  if (loading) {
    return (
      <div className="app-frame splash-screen">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return children;
}
