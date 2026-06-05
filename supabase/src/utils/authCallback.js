import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function resolvePostOAuthRoute() {
  if (!isSupabaseConfigured || !supabase) return '/auth';

  const intent = new URLSearchParams(window.location.search).get('intent') ?? 'signin';

  // Avec detectSessionInUrl: true, Supabase échange le code automatiquement.
  // On attend que la session soit disponible (retry si race condition).
  let session = null;
  for (let i = 0; i < 5; i++) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) { session = data.session; break; }
    } catch { /* ignore */ }
    await new Promise((r) => setTimeout(r, 500));
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
