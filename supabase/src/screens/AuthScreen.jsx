import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AuthScreen() {
  const { signInGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      const result = await signInGoogle();
      alert('signInGoogle result: ' + JSON.stringify(result));
      if (!isSupabaseConfigured) {
        navigate('/onboarding/email');
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

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
          <button
            type="button"
            className="auth-screen__btn auth-screen__btn--google"
            onClick={handleGoogle}
          >
            Continuer avec Google
          </button>
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
