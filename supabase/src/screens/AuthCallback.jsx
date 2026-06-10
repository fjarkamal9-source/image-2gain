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
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sphereGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="55%" stopColor="#FF6B00" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1A3FCC" />
          </radialGradient>
          <radialGradient id="shine" cx="33%" cy="27%" r="38%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="110" r="100" fill="url(#sphereGrad)" />
        <circle cx="110" cy="110" r="100" fill="url(#shine)" />
      </svg>
    </div>
  );
}
