import { Capacitor } from '@capacitor/core';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

const MOCK_GOOGLE = { id: 'mock-u1', email: 'kamal@2gain.app', prenom: 'K' };

function getOAuthRedirectTo() {
  return Capacitor.isNativePlatform()
    ? 'com.deuxgain.app://auth/callback'
    : `${window.location.origin}/auth/callback`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          prenom:
            session.user.user_metadata?.prenom ||
            session.user.user_metadata?.full_name?.split(' ')?.[0] ||
            'Sportif',
        });
      }
      setLoading(false);
    }).catch(err => console.error('getSession error:', err));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          prenom:
            session.user.user_metadata?.prenom ||
            session.user.user_metadata?.full_name?.split(' ')?.[0] ||
            'Sportif',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Déclenche Google OAuth au clic — standard flow, pas de pré-fetch. */
  const signInGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      if (import.meta.env.DEV) {
        setUser(MOCK_GOOGLE);
        return { mock: true };
      }
      console.error('signInGoogle: Supabase non configuré');
      return { error: 'not_configured' };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getOAuthRedirectTo() },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return { error };
    }
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
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isMock: !isSupabaseConfigured,
      signInGoogle,
      signOut,
    }),
    [user, loading, signInGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
