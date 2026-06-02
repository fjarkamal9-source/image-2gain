import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
  const { user, loading, isMock } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    if (!user) {
      setOnboardingDone(null);
      return;
    }
    if (isMock || !isSupabaseConfigured || !supabase) {
      setOnboardingDone(true);
      return;
    }
    let cancelled = false;
    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setOnboardingDone(!!data?.onboarding_completed);
      })
      .catch(() => {
        if (!cancelled) setOnboardingDone(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isMock]);

  if (loading || (user && onboardingDone === null)) {
    return (
      <div className="app-frame splash-screen">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!onboardingDone) {
    return <Navigate to="/onboarding/email" replace />;
  }

  return children;
}
