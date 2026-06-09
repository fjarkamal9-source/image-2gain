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

    let timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) return;
        resolve(session);
      }
    );

    async function resolve(session) {
      if (hasNavigated.current) return;
      hasNavigated.current = true;
      subscription.unsubscribe();
      clearTimeout(timeout);

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          try {
            localStorage.setItem('onboarding_completed', 'true');
          } catch { /* ignore */ }
          navigate('/home', { replace: true });
        } else if (profile?.first_name) {
          navigate('/onboarding/welcome-rules', { replace: true });
        } else {
          navigate('/welcome-new-user', { replace: true });
        }
      } catch {
        navigate('/welcome-new-user', { replace: true });
      }
    }

    // Fallback immédiat : session déjà en mémoire/localStorage
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session && !hasNavigated.current) {
        resolve(data.session);
      }
    });

    timeout = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        subscription.unsubscribe();
        navigate('/auth', { replace: true });
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="app-frame splash-screen">
      <p>Connexion en cours…</p>
    </div>
  );
}
