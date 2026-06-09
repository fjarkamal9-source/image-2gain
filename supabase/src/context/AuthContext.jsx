import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasExchanged = useRef(false);

  // Écouter le deep link Android (retour depuis Google OAuth via Custom Tab)
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isSupabaseConfigured || !supabase) return;

    const listener = App.addListener('appUrlOpen', async ({ url }) => {
      if (!url.startsWith('com.deuxgain.app://auth/callback')) return;
      if (hasExchanged.current) return;
      hasExchanged.current = true;

      if (Capacitor.isNativePlatform()) {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close().catch(() => {});
      }

      const urlObj = new URL(url.replace('com.deuxgain.app://', 'https://placeholder.com/'));
      const code = urlObj.searchParams.get('code');
      const intent = urlObj.searchParams.get('intent') ?? 'signin';

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data?.session) {
          console.error('Android PKCE error:', error?.message);
          hasExchanged.current = false;
          navigate('/auth', { replace: true });
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_name')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate('/home', { replace: true });
        } else if (profile?.first_name) {
          navigate('/onboarding/welcome-rules', { replace: true });
        } else if (intent === 'signup') {
          navigate('/onboarding/welcome-rules', { replace: true });
        } else {
          navigate('/welcome-new-user', { replace: true });
        }
      }
    });

    return () => { listener.then(l => l.remove()); };
  }, [navigate]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('2gain_user_profile');
    localStorage.removeItem('2gain_profile_complete');
    localStorage.removeItem('profile_photo_url');
    localStorage.removeItem('onboarding_completed');
    Object.keys(localStorage)
      .filter((k) => k.startsWith('onboarding_'))
      .forEach((k) => localStorage.removeItem(k));
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signOut,
    }),
    [user, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
