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

    const intent = new URLSearchParams(window.location.search).get('intent') ?? 'signin';

    // Écoute onAuthStateChange — source de vérité unique
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (hasNavigated.current) return;
        if (!session) return;

        hasNavigated.current = true;
        subscription.unsubscribe();

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.onboarding_completed) {
            navigate('/home', { replace: true });
          } else if (intent === 'signup') {
            navigate('/onboarding/welcome-rules', { replace: true });
          } else {
            navigate('/welcome-new-user', { replace: true });
          }
        } catch {
          navigate('/welcome-new-user', { replace: true });
        }
      }
    );

    // Timeout fallback 15 secondes
    const timeout = setTimeout(() => {
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
