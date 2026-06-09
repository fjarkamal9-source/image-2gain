import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboardingJSON, setOnboardingJSON } from '../../utils/storage';

const SPORTS = [
  'Musculation', 'Running', 'Fitness', 'Yoga', 'CrossFit', 'Natation',
  'Cyclisme', 'Boxe', 'Danse', 'Escalade', 'Tennis', 'Football',
  'Basketball', 'Padel', 'Golf', 'Randonnée', 'Ski', 'Surf', 'Pilates', 'HIIT',
];

export default function OnboardingSports() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboardingJSON('sports', []));

  const toggle = (sport) => {
    setSelected((prev) => {
      if (prev.includes(sport)) return prev.filter((s) => s !== sport);
      if (prev.length >= 3) return prev;
      return [...prev, sport];
    });
  };

  const valid = selected.length >= 1;

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>Quels sports tu pratiques ?</h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>Sélectionne au moins 1 sport (3 max recommandés)</p>
      <div className="sports-tags">
        {SPORTS.map((sport) => (
          <button
            key={sport}
            type="button"
            className={`sport-tag ${selected.includes(sport) ? 'sport-tag--selected' : ''}`}
            style={selected.includes(sport) ? undefined : { color: '#111111', fontWeight: '700' }}
            onClick={() => toggle(sport)}
          >
            {sport}
          </button>
        ))}
      </div>
      <div className="onboarding-footer">
        <CTAButton variant="outline"
          disabled={!valid}
          onClick={() => {
            setOnboardingJSON('sports', selected);
            navigate('/onboarding/photo');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
