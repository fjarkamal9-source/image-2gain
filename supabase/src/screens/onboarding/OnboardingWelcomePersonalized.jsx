import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding } from '../../utils/storage';

export default function OnboardingWelcomePersonalized() {
  const navigate = useNavigate();
  const prenom = getOnboarding('prenom', 'Sportif');

  return (
    <div className="onboarding-page onboarding-page--center">
      <div className="welcome-emoji-circle">👋</div>
      <h1 className="onboarding-title" style={{ color: '#111111' }}>Bienvenue, {prenom} 👋</h1>
      <p className="onboarding-sub" style={{ color: '#111111' }}>La motivation, c&apos;est mieux à plusieurs !</p>
      <p className="onboarding-sub" style={{ color: '#111111' }}>Ensemble on va plus loin !</p>
      <div className="onboarding-footer">
        <CTAButton variant="outline" onClick={() => navigate('/onboarding/birth-date')}>
          C&apos;est parti !
        </CTAButton>
      </div>
    </div>
  );
}
