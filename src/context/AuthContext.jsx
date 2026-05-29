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
    const init = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            prenom: data.session.user.user_metadata?.prenom || 'Sportif',
          });
          setLoading(false);
          return;
        }
      }
      const saved = getSession();
      setUser(saved);
      setLoading(false);
    };
    init();
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
