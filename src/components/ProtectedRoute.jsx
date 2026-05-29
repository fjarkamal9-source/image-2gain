import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSession } from '../utils/storage';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const session = getSession();

  if (loading) {
    return (
      <div className="app-frame splash-screen">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!user && !session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
