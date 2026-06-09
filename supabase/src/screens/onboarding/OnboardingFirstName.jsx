import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [prenom, setPrenom] = useState(getOnboarding('prenom', ''));
  const valid = prenom.trim().length >= 2;

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>Comment tu t&apos;appelles ?</h1>
      <input
        className="onboarding-input"
        placeholder="Ton prénom"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        maxLength={30}
      />
      <div className="onboarding-footer">
        <CTAButton variant="outline"
          disabled={!valid}
          onClick={() => {
            setOnboarding('prenom', prenom.trim());
            navigate('/onboarding/welcome-personalized');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
