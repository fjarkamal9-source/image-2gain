import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { setSession } from './storage';

export async function resolvePostOAuthRoute() {
  if (!isSupabaseConfigured || !supabase) {
    return '/auth';
  }

  console.log('URL params:', window.location.search);

  const code = new URLSearchParams(window.location.search).get('code');
  let session;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data?.session) {
      console.error('exchangeCodeForSession failed:', error);
      return '/auth';
    }
    session = data.session;
  } else {
    const { data } = await supabase.auth.getSession();
    session = data?.session;
  }

  if (!session?.user) {
    return '/auth';
  }

  const user = session.user;
  setSession({
    id: user.id,
    email: user.email || '',
    prenom: user.user_metadata?.full_name?.split(' ')?.[0] || user.user_metadata?.prenom || 'Sportif',
  });

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && profile?.onboarding_completed) {
      return '/home';
    }
  } catch {
    /* fallback local */
  }

  try {
    const local = localStorage.getItem('2gain_user_profile');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed?.prenom && parsed?.ville) return '/home';
    }
  } catch {
    /* ignore */
  }

  return '/onboarding/email';
}
