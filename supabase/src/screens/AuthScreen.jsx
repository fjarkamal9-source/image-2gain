import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8, flexShrink: 0 }} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function AuthScreen() {
  const { signInGoogle } = useAuth();

  const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

  const triggerOAuth = async (intent) => {
    if (Capacitor.isNativePlatform()) {
      // Android/iOS — Capacitor Browser (Custom Tab) + deep link
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `com.deuxgain.app://auth/callback?intent=${intent}`,
          skipBrowserRedirect: true,
        },
      });
      if (!error && data?.url) await Browser.open({ url: data.url });
      return;
    }
    // Web — flow standard, Supabase redirige automatiquement
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${APP_URL}/auth/callback?intent=${intent}` },
    });
  };

  const handleSignIn = () => triggerOAuth('signin');
  const handleSignUp = () => triggerOAuth('signup');

  return (
    <div className="app-frame auth-screen">
      {/* Tagline positionné sous le logo de l'image de fond */}
      <h1
        style={{
          position: 'absolute',
          top: '42%',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#1A3FCC',
          fontFamily: 'var(--font-title)',
          fontSize: 28,
          fontWeight: 900,
          lineHeight: 1.25,
          margin: 0,
          zIndex: 1,
        }}
      >
        Le sport est <span style={{ color: '#FF6B00' }}>meilleur</span><br />
        à <span style={{ color: '#FF6B00' }}>plusieurs</span>
      </h1>

      {/* Boutons en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 24,
          right: 24,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          className="auth-screen__btn auth-screen__btn--google"
          style={{ width: '100%' }}
          onClick={handleSignIn}
        >
          <GoogleIcon /> Continuer avec Google
        </button>
        <div className="auth-separator" style={{ width: '100%' }}>
          <span className="auth-separator-line" />
          <span className="auth-separator-text">OU</span>
          <span className="auth-separator-line" />
        </div>
        <button type="button" className="auth-create-account" onClick={handleSignUp}>
          Créer un compte <span>›</span>
        </button>
        <button
          type="button"
          className="auth-screen__help"
          onClick={() => {
            window.location.href = 'mailto:kamal1002026@outlook.fr?subject=Problème de connexion 2GAIN';
          }}
        >
          Problème de connexion ?
        </button>
        <p className="auth-screen__legal">
          En continuant tu acceptes nos CGU et politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
