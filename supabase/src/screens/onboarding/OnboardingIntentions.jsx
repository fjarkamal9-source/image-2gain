import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboardingJSON, setOnboardingJSON } from '../../utils/storage';

const OPTIONS = [
  { value: 'partner', emoji: '🏋️', label: 'Partenaire sportif', desc: "S'entraîner ensemble régulièrement" },
  { value: 'romance', emoji: '🧡', label: 'Romance sportive', desc: 'Rencontrer quelqu\'un qui partage ta passion' },
  { value: 'friendly', emoji: '🤝', label: 'Rencontre amicale', desc: 'Agrandir ton cercle sportif' },
  { value: 'session', emoji: '🔥', label: "Plaisir d'une séance", desc: 'Une session sympa sans prise de tête' },
  { value: 'casual', emoji: '🎯', label: 'On verra si tu me suis', desc: 'Pas de pression, on verra bien' },
  { value: 'events', emoji: '📅', label: 'Événements sportifs', desc: 'Courses, compétitions, sorties collectives' },
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
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>
        Tu cherches quoi ?
      </h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>
        Jusqu&apos;à 3 intentions
      </p>

      <div className="intention-list">
        {OPTIONS.map(({ value, emoji, label, desc }) => {
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              className={`intention-card-stack ${isSelected ? 'intention-card-stack--selected' : ''}`}
              onClick={() => toggle(value)}
            >
              <span className="intention-card-stack__emoji">{emoji}</span>
              <span className="intention-card-stack__text">
                <span
                  className="intention-card-stack__label"
                  style={isSelected ? { color: '#FF6B00', fontWeight: '700', fontSize: 16 } : { color: '#111111', fontWeight: '700', fontSize: 16 }}
                >
                  {label}
                </span>
                <span className="intention-card-stack__desc">{desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="onboarding-footer">
        <CTAButton
          variant="outline"
          disabled={selected.length === 0}
          onClick={() => {
            setOnboardingJSON('intentions', selected);
            navigate('/onboarding/photo');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
