import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboardingJSON, setOnboardingJSON } from '../../utils/storage';

const OPTIONS = [
  { value: 'partner', label: 'Partenaire sportif', emoji: '🏋️' },
  { value: 'romance', label: 'Romance sportive', emoji: '🧡' },
  { value: 'friendly', label: 'Rencontre amicale', emoji: '🤝' },
  { value: 'session', label: "Le plaisir d'une séance", emoji: '🔥' },
  { value: 'casual', label: 'On verra si tu me suis', emoji: '🎯' },
  { value: 'events', label: 'Événements sportifs', emoji: '📅' },
];

export default function OnboardingIntentions() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboardingJSON('intentions', []));

  const toggle = (value) => {
    setSelected((prev) => {
      if (prev.includes(value)) return prev.filter((x) => x !== value);
      if (prev.length >= 3) return prev;
      return [...prev, value];
    });
  };

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title">Tu cherches quoi ?</h1>
      <p className="onboarding-sub">Sélectionne jusqu'à 3 intentions</p>
      <div className="intentions-grid">
        {OPTIONS.map(({ value, label, emoji }) => (
          <button
            key={value}
            type="button"
            className={`intention-card ${selected.includes(value) ? 'intention-card--selected' : ''}`}
            onClick={() => toggle(value)}
          >
            <span className="intention-emoji">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="onboarding-footer">
        <CTAButton variant="outline"
          disabled={selected.length === 0}
          onClick={() => {
            setOnboardingJSON('intentions', selected);
            navigate('/onboarding/sports');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
