import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/auth', { replace: true });
      return;
    }

    let subscription;
    let timeout;

    async function init() {
      // Parse manuel du hash pour flow implicit
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (hasNavigated.current) return;
          if (!session) return;

          hasNavigated.current = true;
          sub.unsubscribe();

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed, first_name')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile?.onboarding_completed) {
              // Compte existant + onboarding complété → home
              navigate('/home', { replace: true });
            } else if (profile?.first_name) {
              // Compte existant + onboarding non complété → reprendre l'onboarding
              navigate('/onboarding/welcome-rules', { replace: true });
            } else {
              // Nouveau compte → modal bienvenue
              navigate('/welcome-new-user', { replace: true });
            }
          } catch {
            navigate('/welcome-new-user', { replace: true });
          }
        }
      );
      subscription = sub;

      timeout = setTimeout(() => {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          subscription?.unsubscribe();
          navigate('/auth', { replace: true });
        }
      }, 15000);
    }

    init();

    return () => {
      subscription?.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="app-frame splash-screen">
      <p>Connexion en cours…</p>
    </div>
  );
}
