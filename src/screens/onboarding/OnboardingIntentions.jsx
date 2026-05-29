import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboardingJSON, setOnboardingJSON } from '../../utils/storage';

const OPTIONS = [
  { emoji: '🏋️', label: 'Partenaire sportif' },
  { emoji: '🧡', label: 'Romance sportive' },
  { emoji: '🤝', label: 'Rencontre amicale' },
  { emoji: '🔥', label: "Le plaisir d'une séance" },
  { emoji: '🎯', label: 'On verra si tu me suis' },
  { emoji: '📅', label: 'Événements sportifs' },
];

export default function OnboardingIntentions() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboardingJSON('intentions', []));

  const toggle = (label) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title">Tu cherches quoi ?</h1>
      <p className="onboarding-sub">Sélectionne tes intentions (plusieurs choix possibles)</p>
      <div className="intentions-grid">
        {OPTIONS.map(({ emoji, label }) => (
          <button
            key={label}
            type="button"
            className={`intention-card ${selected.includes(label) ? 'intention-card--selected' : ''}`}
            onClick={() => toggle(label)}
          >
            <span className="intention-emoji">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="onboarding-footer">
        <CTAButton
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
