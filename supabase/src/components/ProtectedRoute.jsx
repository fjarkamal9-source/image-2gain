import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requireOnboarding = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-frame splash-screen">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requireOnboarding) {
    const done = localStorage.getItem('onboarding_completed') === 'true';
    if (!done) return <Navigate to="/onboarding/welcome-rules" replace />;
  }

  return children;
}
