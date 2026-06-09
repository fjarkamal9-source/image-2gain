import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

const OPTIONS = [
  { value: 'debutant', label: 'Débutant', desc: 'Je débute ou je reprends' },
  { value: 'intermediaire', label: 'Intermédiaire', desc: 'Je pratique régulièrement' },
  { value: 'avance', label: 'Avancé', desc: "Je m'entraîne sérieusement" },
  { value: 'expert', label: 'Expert', desc: 'Compétition ou coaching' },
];

export default function OnboardingNiveau() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboarding('niveau', ''));

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>Quel est ton niveau ?</h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>Pour des matchs équilibrés</p>
      <div className="choice-list">
        {OPTIONS.map(({ value, label, desc }) => (
          <button
            key={value}
            type="button"
            className={`choice-card ${selected === value ? 'choice-card--selected' : ''}`}
            style={selected === value ? undefined : { color: '#111111', fontWeight: '700' }}
            onClick={() => setSelected(value)}
          >
            <span style={selected === value ? undefined : { color: '#111111', fontWeight: '700' }}>{label}</span>
            <span className="choice-card__desc" style={selected === value ? undefined : { color: '#111111', fontWeight: '700' }}>{desc}</span>
          </button>
        ))}
      </div>
      <div className="onboarding-footer">
        <CTAButton variant="outline"
          disabled={!selected}
          onClick={() => {
            setOnboarding('niveau', selected);
            navigate('/onboarding/frequency');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
