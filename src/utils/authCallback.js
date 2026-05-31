import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { setSession } from './storage';

export async function resolvePostOAuthRoute() {
  if (!isSupabaseConfigured || !supabase) return '/auth';

  const search = window.location.search;
  const hash = window.location.hash;
  const href = window.location.href;

  alert('CALLBACK\nhref: ' + href.substring(0, 100));

  const code = new URLSearchParams(search).get('code');
  if (code) {
    alert('Flow PKCE - code trouvé');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data?.session) {
      alert('PKCE error: ' + (error?.message || 'no session'));
      return '/auth';
    }
    return await resolveRoute(data.session);
  }

  const hashParams = new URLSearchParams(hash.substring(1));
  const access_token = hashParams.get('access_token');
  const refresh_token = hashParams.get('refresh_token');

  if (access_token && refresh_token) {
    alert('Flo implicit - tokens trouvés');
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error || !data?.session) {
      alert('Implicit error: ' + (error?.message || 'no session'));
      return '/auth';
    }
    return await resolveRoute(data.session);
  }

  alert('Pas de code ni token\nsearch: ' + search + '\nhash: ' + hash.substring(0, 50));

  const { data } = await supabase.auth.getSession();
  if (data?.session) return await resolveRoute(data.session);

  return '/auth';
}

async function resolveRoute(session) {
  const user = session.user;
  setSession({
    id: user.id,
    email: user.email || '',
    prenom: user.user_metadata?.full_name?.split(' ')?.[0] || user.user_metadata?.prenom || 'Sportif',
  });

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.onboarding_completed) return '/home';
  } catch { /* ignore */ }

  try {
    const local = localStorage.getItem('2gain_user_profile');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed?.prenom && parsed?.ville) return '/home';
    }
  } catch { /* ignore */ }

  return '/onboarding/email';
}
