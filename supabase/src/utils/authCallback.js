import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function resolvePostOAuthRoute() {
  if (!isSupabaseConfigured || !supabase) return '/auth';

  const search = window.location.search;
  const hash = window.location.hash;

  const code = new URLSearchParams(search).get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data?.session) {
      console.error('PKCE error:', error?.message || 'no session');
      return '/auth';
    }
    return await resolveRoute(data.session);
  }

  const hashParams = new URLSearchParams(hash.substring(1));
  const access_token = hashParams.get('access_token');
  const refresh_token = hashParams.get('refresh_token');

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error || !data?.session) {
      console.error('Implicit error:', error?.message || 'no session');
      return '/auth';
    }
    return await resolveRoute(data.session);
  }

  console.error('Pas de code ni token', { search, hash: hash.substring(0, 50) });

  const { data } = await supabase.auth.getSession();
  if (data?.session) return await resolveRoute(data.session);

  return '/auth';
}

async function resolveRoute(session) {
  const user = session.user;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.onboarding_completed) return '/home';
  } catch { /* ignore */ }

  return '/onboarding/welcome-rules';
}
