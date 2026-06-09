import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding } from '../../utils/storage';

export default function OnboardingWelcomePersonalized() {
  const navigate = useNavigate();
  const prenom = getOnboarding('prenom', 'Sportif');

  return (
    <div className="onboarding-page onboarding-page--center">
      <div className="welcome-emoji-circle">👋</div>
      <h1 className="onboarding-title">Bienvenue, {prenom} 👋</h1>
      <p className="onboarding-sub">La motivation, c&apos;est mieux à plusieurs !</p>
      <p className="onboarding-sub">Ensemble on va plus loin !</p>
      <div className="onboarding-footer">
        <CTAButton variant="outline" onClick={() => navigate('/onboarding/birth-date')}>
          C&apos;est parti !
        </CTAButton>
      </div>
    </div>
  );
}
