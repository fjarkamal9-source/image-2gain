import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { flushOnboardingToProfile } from '../../utils/completeOnboarding';

export default function OnboardingMotivationFinal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finish = async () => {
    setLoading(true);
    setError('');
    try {
      await flushOnboardingToProfile();
      navigate('/swipe-intro', { replace: true });
    } catch {
      setError('Une erreur est survenue. Vérifie ta connexion et réessaie.');
      setLoading(false);
    }
  };

  return (
    <div className="app-frame motivation-screen">
      <div className="motivation-bg" aria-hidden>
        <img src="/img/swipe-intro.png" alt="" />
      </div>
      <div className="motivation-content">
        <div className="motivation-tags">
          <span className="motivation-tag motivation-tag--blue">🏃 Jogging</span>
          <span className="motivation-tag motivation-tag--orange">🤝 Rencontre amicale</span>
        </div>
        <h1 className="motivation-slogan">
          <span>Qui se ressemble,</span>
          <span className="motivation-accent">s&apos;entraîne</span>
          <span>ensemble</span>
        </h1>
        <p className="motivation-desc">
          Trouve des partenaires sportifs près de toi et atteignez vos objectifs ensemble.
        </p>
        <CTAButton disabled={loading} onClick={finish}>
          {loading ? 'Chargement...' : 'Commence à trouver'}
        </CTAButton>
        {error && (
          <p style={{ color: 'red', textAlign: 'center', marginTop: 12 }}>{error}</p>
        )}
      </div>
    </div>
  );
}
