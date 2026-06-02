import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

const MOCK_GOOGLE = { id: 'mock-u1', email: 'kamal@2gain.app', prenom: 'K' };

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

  const signInGoogle = useCallback(() => {
    if (isSupabaseConfigured && supabase) {
      const isNative = window.location.protocol === 'capacitor:';
      const redirectTo = isNative
        ? 'com.deuxgain.app://auth/callback'
        : window.location.origin + '/auth/callback';
      alert(`origin: ${window.location.origin}\nredirectTo: ${redirectTo}\nprotocol: ${window.location.protocol}`);
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: false },
      }).then(({ error }) => {
        if (error) console.error('OAuth error:', error);
      });
      return;
    }
    setUser(MOCK_GOOGLE);
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('2gain_user_profile');
    localStorage.removeItem('2gain_profile_complete');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isMock: !isSupabaseConfigured, signInGoogle, signOut }),
    [user, loading, signInGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
