import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../utils/storage';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      const session = getSession();
      navigate(session ? '/home' : '/auth', { replace: true });
    }, 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="app-frame splash-screen">
      <img src="/logo-2gain.png" alt="2GAIN" className="splash-logo" />
      <p className="splash-tagline">Qui se ressemble, s&apos;entraîne ensemble</p>
    </div>
  );
}
