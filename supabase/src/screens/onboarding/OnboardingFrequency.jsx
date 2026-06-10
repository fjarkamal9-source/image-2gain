import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboardingJSON, setOnboarding, setOnboardingJSON } from '../../utils/storage';

const DAYS = [
  { key: 'lundi', label: 'L' },
  { key: 'mardi', label: 'M' },
  { key: 'mercredi', label: 'M' },
  { key: 'jeudi', label: 'J' },
  { key: 'vendredi', label: 'V' },
  { key: 'samedi', label: 'S' },
  { key: 'dimanche', label: 'D' },
];

function frequencyLabel(count) {
  if (count === 0) return 'Sélectionne au moins 1 jour';
  if (count === 1) return '1 jour par semaine';
  if (count <= 3) return '2 à 3 jours par semaine';
  if (count <= 5) return '4 à 5 jours par semaine';
  return '6 à 7 jours par semaine';
}

function frequencySlug(count) {
  if (count === 0) return 'variable';
  if (count === 1) return '1';
  if (count <= 3) return '2-3';
  if (count <= 5) return '4-5';
  return '6+';
}

export default function OnboardingFrequency() {
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState(getOnboardingJSON('training_days', []));

  const toggle = (key) => {
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const count = selectedDays.length;
  const valid = count > 0;

  return (
    <div className="onboarding-page onboarding-page--frequency">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>
        Quels jours tu t&apos;entraînes ?
      </h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>
        Sélectionne tes jours habituels
      </p>

      <div className="training-days-row">
        {DAYS.map(({ key, label }) => {
          const isSelected = selectedDays.includes(key);
          return (
            <button
              key={key}
              type="button"
              className={`day-circle ${isSelected ? 'day-circle--selected' : ''}`}
              onClick={() => toggle(key)}
              aria-label={key}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="frequency-summary">{frequencyLabel(count)}</p>
      <p className="frequency-note">C&apos;est juste une indication, ça peut varier</p>

      <div className="onboarding-footer">
        <CTAButton
          variant="outline"
          disabled={!valid}
          onClick={() => {
            setOnboardingJSON('training_days', selectedDays);
            setOnboarding('frequency', frequencySlug(count));
            navigate('/onboarding/max-distance');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
