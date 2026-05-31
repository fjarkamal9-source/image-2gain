import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { setOnboarding } from '../utils/storage';

export default function AuthScreen() {
  const { signInGoogle, signInPhone } = useAuth();
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      await signInGoogle();
      if (!isSupabaseConfigured) {
        setOnboarding('email', 'kamal@2gain.app');
        setOnboarding('prenom', 'K');
        navigate('/onboarding/email');
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  const handlePhone = async () => {
    await signInPhone();
    navigate('/onboarding/email');
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
          {/* <p className="auth-screen__sep">ou</p>
          <button
            type="button"
            className="auth-screen__btn auth-screen__btn--phone"
            onClick={handlePhone}
          >
            Continuer avec ton numéro
          </button> */}
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
