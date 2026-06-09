import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

const OPTIONS = ['Homme', 'Femme', 'Non-binaire / Autre'];

export default function OnboardingGender() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboarding('gender', ''));

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111' }}>À quel genre tu t&apos;identifies ?</h1>
      <div className="choice-list">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`choice-card ${selected === opt ? 'choice-card--selected' : ''}`}
            style={selected === opt ? undefined : { color: '#111111' }}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="onboarding-footer">
        <CTAButton variant="outline"
          disabled={!selected}
          onClick={() => {
            setOnboarding('gender', selected);
            navigate('/onboarding/looking-for-gender');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
