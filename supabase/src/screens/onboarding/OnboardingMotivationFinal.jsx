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
      const result = await flushOnboardingToProfile();
      if (!result) {
        setError('Erreur de sauvegarde. Vérifie ta connexion et réessaie.');
        setLoading(false);
        return;
      }
      navigate('/swipe-intro', { replace: true });
    } catch (err) {
      console.error('flush error:', err);
      setError('Erreur de sauvegarde. Vérifie ta connexion et réessaie.');
      setLoading(false);
    }
  };

  return (
    <div className="app-frame motivation-screen" style={{ background: '#ffffff' }}>
      <div className="motivation-content" style={{ background: 'transparent' }}>
        <div className="motivation-tags">
          <span className="motivation-tag motivation-tag--blue" style={{ color: '#111111' }}>🏃 Jogging</span>
          <span className="motivation-tag motivation-tag--orange" style={{ color: '#111111' }}>🤝 Rencontre amicale</span>
        </div>
        <h1 className="motivation-slogan" style={{ color: '#111111' }}>
          <span>Qui se ressemble,</span>
          <span className="motivation-accent">s&apos;entraîne</span>
          <span>ensemble</span>
        </h1>
        <p className="motivation-desc" style={{ color: '#111111' }}>
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
