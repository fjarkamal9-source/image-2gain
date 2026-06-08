import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function resolvePostOAuthRoute() {
  if (!isSupabaseConfigured || !supabase) return '/auth';
  const intent = new URLSearchParams(window.location.search).get('intent') ?? 'signin';

  // Attend la session via onAuthStateChange OU getSession() en parallèle
  const session = await new Promise((resolve) => {
    let resolved = false;

    // Listener temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (s && !resolved) {
        resolved = true;
        subscription.unsubscribe();
        resolve(s);
      }
    });

    // Polling fallback toutes les 400ms pendant 12 secondes
    let attempts = 0;
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session && !resolved) {
          resolved = true;
          clearInterval(interval);
          subscription.unsubscribe();
          resolve(data.session);
        }
      } catch { /* ignore */ }
      attempts++;
      if (attempts >= 30) {
        clearInterval(interval);
        if (!resolved) {
          resolved = true;
          subscription.unsubscribe();
          resolve(null);
        }
      }
    }, 400);
  });

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
