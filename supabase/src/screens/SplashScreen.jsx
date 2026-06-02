import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo2Gain from '../components/ui/Logo2Gain';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!isSupabaseConfigured || !supabase) {
        navigate('/auth', { replace: true });
        return;
      }
      const { data } = await supabase.auth.getSession();
      navigate(data?.session ? '/home' : '/auth', { replace: true });
    }, 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="app-frame splash-screen">
      <Logo2Gain className="splash-logo" />
      <p className="splash-tagline">Qui se ressemble, s&apos;entraîne ensemble</p>
    </div>
  );
}
