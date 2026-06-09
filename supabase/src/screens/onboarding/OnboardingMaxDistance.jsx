import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

export default function OnboardingMaxDistance() {
  const navigate = useNavigate();
  const [km, setKm] = useState(Number(getOnboarding('max_distance', 25)) || 25);

  return (
    <div className="onboarding-page onboarding-page--center">
      <h1 className="onboarding-title">Distance maximale</h1>
      <p className="onboarding-sub">Pour trouver des sportifs près de toi</p>
      <p className="distance-value">{km} km</p>
      <input
        type="range"
        min={1}
        max={100}
        value={km}
        onChange={(e) => setKm(Number(e.target.value))}
        className="distance-slider"
      />
      <div className="onboarding-footer">
        <CTAButton variant="outline"
          onClick={() => {
            setOnboarding('max_distance', km);
            navigate('/onboarding/intentions');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
