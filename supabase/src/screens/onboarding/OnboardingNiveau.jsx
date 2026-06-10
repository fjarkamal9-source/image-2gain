import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getSportBySlug } from '../../constants/sportsByCategory';
import { getOnboardingJSON, setOnboarding, setOnboardingJSON } from '../../utils/storage';

const NIVEAUX = [
  { slug: 'debutant', label: 'Débutant' },
  { slug: 'intermediaire', label: 'Inter.' },
  { slug: 'avance', label: 'Avancé' },
  { slug: 'expert', label: 'Expert' },
];

export default function OnboardingNiveau() {
  const navigate = useNavigate();
  const sports = getOnboardingJSON('sports', []);
  const [niveaux, setNiveaux] = useState(() => getOnboardingJSON('niveaux_par_sport', {}));

  const setNiveau = (sportSlug, niveauSlug) => {
    setNiveaux((prev) => ({ ...prev, [sportSlug]: niveauSlug }));
  };

  const allFilled = sports.length > 0 && sports.every((slug) => niveaux[slug]);

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>
        Quel est ton niveau ?
      </h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>
        Définis ton niveau pour chaque sport sélectionné
      </p>

      <div className="niveau-sport-list">
        {sports.map((slug) => {
          const sport = getSportBySlug(slug);
          if (!sport) return null;
          return (
            <div key={slug} className="niveau-sport-card">
              <div className="niveau-sport-header">
                <span className="niveau-sport-emoji">{sport.emoji}</span>
                <span className="niveau-sport-name" style={{ color: '#111111', fontWeight: '700' }}>
                  {sport.label}
                </span>
              </div>
              <div className="niveau-pills">
                {NIVEAUX.map(({ slug: niveauSlug, label }) => {
                  const isSelected = niveaux[slug] === niveauSlug;
                  return (
                    <button
                      key={niveauSlug}
                      type="button"
                      className={`niveau-pill ${isSelected ? 'niveau-pill--selected' : ''}`}
                      onClick={() => setNiveau(slug, niveauSlug)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="onboarding-footer">
        <CTAButton
          variant="outline"
          disabled={!allFilled}
          onClick={() => {
            setOnboardingJSON('niveaux_par_sport', niveaux);
            setOnboarding('niveau', niveaux[sports[0]] || null);
            navigate('/onboarding/frequency');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
