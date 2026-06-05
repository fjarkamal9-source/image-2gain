import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function resolvePostOAuthRoute() {
  if (!isSupabaseConfigured || !supabase) return '/auth';

  const search = window.location.search;
  const hash = window.location.hash;

  const params = new URLSearchParams(search);
  const code = params.get('code');
  const intent = params.get('intent') ?? 'signin';

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data?.session) {
      console.error('PKCE error:', error?.message || 'no session');
      return '/auth';
    }
    return await resolveRoute(data.session, intent);
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
    return await resolveRoute(data.session, intent);
  }

  console.error('Pas de code ni token', { search, hash: hash.substring(0, 50) });

  const { data } = await supabase.auth.getSession();
  if (data?.session) return await resolveRoute(data.session, intent);

  return '/auth';
}

async function resolveRoute(session, intent = 'signin') {
  const user = session.user;

  // S'assurer que le client a bien le token avant la requête DB (race condition)
  try {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } catch { /* ignore */ }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.onboarding_completed) return '/home';
  } catch { /* ignore */ }

  // Nouveau user : signup → direct onboarding, signin → modal bienvenue
  if (intent === 'signup') return '/onboarding/welcome-rules';
  return '/welcome-new-user';
}
