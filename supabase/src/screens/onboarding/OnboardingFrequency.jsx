import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

const OPTIONS = [
  { value: '1', label: '1 fois' },
  { value: '2-3', label: '2 à 3 fois' },
  { value: '4-5', label: '4 à 5 fois' },
  { value: '6+', label: '6 fois ou plus' },
  { value: 'variable', label: 'Ça varie' },
];

export default function OnboardingFrequency() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboarding('frequency', ''));

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>Tu t'entraînes combien de fois par semaine ?</h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>Pour trouver des partenaires avec le même rythme</p>
      <div className="choice-list">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`choice-card ${selected === value ? 'choice-card--selected' : ''}`}
            style={selected === value ? undefined : { color: '#111111', fontWeight: '700' }}
            onClick={() => setSelected(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="onboarding-footer">
        <CTAButton variant="outline"
          disabled={!selected}
          onClick={() => {
            setOnboarding('frequency', selected);
            navigate('/onboarding/max-distance');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
