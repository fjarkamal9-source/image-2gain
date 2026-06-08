import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function resolvePostOAuthRoute() {
  if (!isSupabaseConfigured || !supabase) return '/auth';
  const intent = new URLSearchParams(window.location.search).get('intent') ?? 'signin';

  // Tente d'échanger le code manuellement si présent dans l'URL
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch { /* ignore — detectSessionInUrl peut déjà l'avoir fait */ }
  }

  // Attend la session avec plus de tentatives (10 × 600ms = 6 secondes max)
  let session = null;
  for (let i = 0; i < 10; i++) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) { session = data.session; break; }
    } catch { /* ignore */ }
    await new Promise((r) => setTimeout(r, 600));
  }

  if (!session) return '/auth';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .maybeSingle();
    if (profile?.onboarding_completed) return '/home';
  } catch { /* ignore */ }

  if (intent === 'signup') return '/onboarding/welcome-rules';
  return '/welcome-new-user';
}
