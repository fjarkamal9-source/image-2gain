import { Capacitor } from '@capacitor/core';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

const MOCK_GOOGLE = { id: 'mock-u1', email: 'kamal@2gain.app', prenom: 'K' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

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
