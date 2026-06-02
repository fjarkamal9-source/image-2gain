import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolvePostOAuthRoute } from '../utils/authCallback';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const hasExchanged = useRef(false);

  const runCallback = useCallback(async () => {
    if (hasExchanged.current) return;
    hasExchanged.current = true;
    try {
      const route = await resolvePostOAuthRoute();
      navigate(route, { replace: true });
    } catch {
      setError('Connexion impossible. Réessayez.');
      setTimeout(() => navigate('/auth', { replace: true }), 2000);
    }
  }, [navigate]);

  useEffect(() => {
    runCallback();
  }, [runCallback]);

  useEffect(() => {
    const handler = () => {
      runCallback();
    };
    window.addEventListener('capacitor-url-open', handler);
    return () => window.removeEventListener('capacitor-url-open', handler);
  }, [runCallback]);

  return (
    <div className="app-frame splash-screen">
      <p>{error || 'Connexion en cours…'}</p>
    </div>
  );
}
