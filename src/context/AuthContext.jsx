import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { clearSession, getSession, setSession } from '../utils/storage';

export const AuthContext = createContext(null);

const MOCK_GOOGLE = { id: 'mock-u1', email: 'kamal@2gain.app', prenom: 'K' };
const MOCK_SMS = { id: 'mock-u2', email: 'test@2gain.app', phone: '+33600000000', prenom: 'Test' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(getSession());
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state:', event, session?.user?.email);
      if (session?.user) {
        const next = {
          id: session.user.id,
          email: session.user.email,
          prenom:
            session.user.user_metadata?.prenom ||
            session.user.user_metadata?.full_name?.split(' ')?.[0] ||
            'Sportif',
        };
        setUser(next);
        setSession(next);
      } else if (event === 'INITIAL_SESSION') {
        setUser(getSession());
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInGoogle = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return;
    }
    setUser(MOCK_GOOGLE);
    setSession(MOCK_GOOGLE);
  }, []);

  const signInPhone = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      return { needsOtp: true };
    }
    setUser(MOCK_SMS);
    setSession(MOCK_SMS);
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    clearSession();
    localStorage.removeItem('2gain_user_profile');
    localStorage.removeItem('2gain_profile_complete');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isMock: !isSupabaseConfigured,
      signInGoogle,
      signInPhone,
      signOut,
    }),
    [user, loading, signInGoogle, signInPhone, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
