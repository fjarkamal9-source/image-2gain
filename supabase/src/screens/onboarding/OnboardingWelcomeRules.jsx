import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';

const RULES = [
  'Respecte les autres sportifs',
  'Sois honnête sur ton niveau',
  'Pas de contenu inapproprié',
  'Application réservée aux 18 ans et plus',
];

export default function OnboardingWelcomeRules() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>Bienvenue sur 2GAIN 🎉</h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>Avant de commencer, quelques règles</p>
      <ul className="rules-list">
        {RULES.map((r) => (
          <li key={r} style={{ color: '#111111', fontWeight: '600' }}>
            <span className="rules-check">✓</span>
            {r}
          </li>
        ))}
      </ul>
      <div className="rules-illustration">🏋️</div>
      <div className="onboarding-footer">
        <CTAButton variant="outline" onClick={() => navigate('/onboarding/first-name')}>
          J&apos;accepte et je continue
        </CTAButton>
      </div>
    </div>
  );
}
