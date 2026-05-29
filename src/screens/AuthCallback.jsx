import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolvePostOAuthRoute } from '../utils/authCallback';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const route = await resolvePostOAuthRoute();
        if (!cancelled) navigate(route, { replace: true });
      } catch {
        if (!cancelled) {
          setError('Connexion impossible. Réessayez.');
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="app-frame splash-screen">
      <p>{error || 'Connexion en cours…'}</p>
    </div>
  );
}
