import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AuthScreen() {
  const { signInGoogle, fetchGoogleOAuthUrl } = useAuth();
  const [googleOAuthUrl, setGoogleOAuthUrl] = useState(null);
  const [oauthLoading, setOauthLoading] = useState(isSupabaseConfigured && !Capacitor.isNativePlatform());

  useEffect(() => {
    if (Capacitor.isNativePlatform() || !isSupabaseConfigured) {
      setOauthLoading(false);
      return;
    }

    let cancelled = false;
    fetchGoogleOAuthUrl().then((url) => {
      if (!cancelled) {
        setGoogleOAuthUrl(url);
        setOauthLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fetchGoogleOAuthUrl]);

  const handleNativeGoogle = async () => {
    try {
      await signInGoogle();
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  const googleLabel = oauthLoading ? 'Chargement…' : 'Continuer avec Google';

  return (
    <div className="app-frame auth-screen">
      <div className="auth-screen__content">
        <div className="auth-screen__spacer" aria-hidden />

        <p className="auth-screen__tagline">
          Rencontre des sportifs
          <br />
          près de toi
        </p>

        <div className="auth-screen__actions">
          {Capacitor.isNativePlatform() ? (
            <button
              type="button"
              className="auth-screen__btn auth-screen__btn--google"
              onClick={handleNativeGoogle}
            >
              Continuer avec Google
            </button>
          ) : (
            <a
              href={googleOAuthUrl || '#'}
              className="auth-screen__btn auth-screen__btn--google"
              aria-disabled={oauthLoading || !googleOAuthUrl}
              onClick={(e) => {
                if (!googleOAuthUrl) e.preventDefault();
              }}
            >
              {googleLabel}
            </a>
          )}
          <button type="button" className="auth-screen__help">
            Problème de connexion ?
          </button>
          <p className="auth-screen__legal">
            En continuant tu acceptes nos CGU et politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}
