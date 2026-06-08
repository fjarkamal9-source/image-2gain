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
    const code = new URLSearchParams(window.location.search).get('code');

    if (!code) {
      navigate('/auth', { replace: true });
      return;
    }

    const handleAuth = async () => {
      if (hasNavigated.current) return;

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data?.session) {
          console.error('OAuth callback error:', error?.message);
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            navigate('/auth', { replace: true });
          }
          return;
        }

        const session = data.session;
        hasNavigated.current = true;

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
      } catch (err) {
        console.error('Auth callback exception:', err);
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          navigate('/auth', { replace: true });
        }
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="app-frame splash-screen">
      <p>Connexion en cours…</p>
    </div>
  );
}
