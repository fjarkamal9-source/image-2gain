import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { SPORTS_BY_CATEGORY } from '../../constants/sportsByCategory';
import { getOnboardingJSON, setOnboardingJSON } from '../../utils/storage';

const MAX_SPORTS = 5;

export default function OnboardingSports() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getOnboardingJSON('sports', []));

  const toggle = (slug) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SPORTS) return prev;
      return [...prev, slug];
    });
  };

  const valid = selected.length >= 1;

  return (
    <div className="onboarding-page onboarding-page--sports">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>
        Quels sports tu pratiques ?
      </h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700', marginBottom: 8 }}>
        Sélectionne jusqu&apos;à 5 sports
      </p>
      <p className="sports-counter">
        {selected.length} / {MAX_SPORTS} sélectionnés
      </p>

      <div className="sports-categories">
        {SPORTS_BY_CATEGORY.map((category) => (
          <section key={category.label} className="sports-category">
            <div className="sports-category-separator">
              <span className="sports-category-label">{category.label}</span>
              <span className="sports-category-line" />
            </div>
            <div className="sports-tags">
              {category.sports.map((sport) => {
                const isSelected = selected.includes(sport.slug);
                return (
                  <button
                    key={sport.slug}
                    type="button"
                    className={`sport-tag ${isSelected ? 'sport-tag--selected' : ''}`}
                    style={isSelected ? undefined : { color: '#111111', fontWeight: '700' }}
                    onClick={() => toggle(sport.slug)}
                  >
                    {sport.emoji} {sport.label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="sports-scroll-hint">↓ Fais défiler pour voir tous les sports</p>

      <div className="onboarding-footer">
        <CTAButton
          variant="outline"
          disabled={!valid}
          onClick={() => {
            setOnboardingJSON('sports', selected);
            navigate('/onboarding/niveau');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
