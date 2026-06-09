import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

const OPTIONS = ['Des hommes', 'Des femmes', 'Tout le monde'];

export default function OnboardingLookingForGender() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboarding('looking_for', ''));

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>Tu veux rencontrer ?</h1>
      <div className="choice-list">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`choice-card ${selected === opt ? 'choice-card--selected' : ''}`}
            style={selected === opt ? undefined : { color: '#111111', fontWeight: '700' }}
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
            setOnboarding('looking_for', selected);
            navigate('/onboarding/niveau');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
