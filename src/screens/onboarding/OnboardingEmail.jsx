import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(getOnboarding('email', ''));
  const valid = EMAIL_RE.test(email.trim());

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title">Ton adresse email</h1>
      <input
        type="email"
        className="onboarding-input"
        placeholder="email@exemple.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <div className="onboarding-footer">
        <CTAButton disabled={!valid} onClick={() => { setOnboarding('email', email.trim()); navigate('/onboarding/welcome-rules'); }}>
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
