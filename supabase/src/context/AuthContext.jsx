import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

const MOCK_GOOGLE = { id: 'mock-u1', email: 'kamal@2gain.app', prenom: 'K' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
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
          .select('onboarding_completed')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate('/home', { replace: true });
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          try {
            const { data } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .maybeSingle();
            setOnboardingDone(data?.onboarding_completed ?? false);
          } catch { /* ignore */ }
        } else {
          setUser(null);
          setOnboardingDone(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      if (import.meta.env.DEV) {
        setUser(MOCK_GOOGLE);
        return { mock: true };
      }
      console.error('signInGoogle: Supabase non configuré');
      return { error: 'not_configured' };
    }
    const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
    const redirectTo = Capacitor.isNativePlatform()
      ? 'com.deuxgain.app://auth/callback'
      : `${APP_URL}/auth/callback?intent=signin`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) console.error('Google OAuth error:', error);
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('2gain_user_profile');
    localStorage.removeItem('2gain_profile_complete');
    localStorage.removeItem('profile_photo_url');
    Object.keys(localStorage)
      .filter((k) => k.startsWith('onboarding_'))
      .forEach((k) => localStorage.removeItem(k));
    setUser(null);
    setOnboardingDone(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      onboardingDone,
      isMock: !isSupabaseConfigured,
      signInGoogle,
      signOut,
    }),
    [user, loading, onboardingDone, signInGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
