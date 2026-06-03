import { Capacitor } from '@capacitor/core';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { submitOAuthRedirect } from '../utils/oauthRedirect';

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

  /**
   * Prépare l'URL OAuth (PKCE) sans naviguer.
   * Sur le web, l'URL doit être utilisée dans un vrai <a href> pour Safari.
   */
  const fetchGoogleOAuthUrl = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOAuthRedirectTo(),
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('OAuth URL error:', error);
      return null;
    }

    return data?.url ?? null;
  }, []);

  /** Android/iOS : navigation programmée après récupération de l'URL. */
  const signInGoogle = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      if (Capacitor.isNativePlatform()) {
        const url = await fetchGoogleOAuthUrl();
        if (url) submitOAuthRedirect(url);
        return { url };
      }

      // Web programmatique (fallback) : laisser Supabase rediriger si possible
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectTo(),
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        return { error };
      }

      if (data?.url) submitOAuthRedirect(data.url);
      return { url: data?.url ?? null };
    }

    if (import.meta.env.DEV) {
      setUser(MOCK_GOOGLE);
      return { mock: true };
    }

    console.error('signInGoogle: Supabase non configuré');
    return { error: 'not_configured' };
  }, [fetchGoogleOAuthUrl]);

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
      fetchGoogleOAuthUrl,
      signOut,
    }),
    [user, loading, signInGoogle, fetchGoogleOAuthUrl, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
