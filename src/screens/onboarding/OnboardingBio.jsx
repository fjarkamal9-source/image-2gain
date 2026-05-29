import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

export default function OnboardingBio() {
  const navigate = useNavigate();
  const [bio, setBio] = useState(getOnboarding('bio', ''));

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title">Parle-nous de toi</h1>
      <p className="onboarding-sub">Une bio sympa attire plus de partenaires</p>
      <textarea
        className="bio-textarea"
        maxLength={150}
        placeholder="Ex: Passionné de running, je cherche des partenaires motivés pour progresser ensemble !"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <p className="bio-counter">{bio.length}/150</p>
      <div className="onboarding-footer">
        <CTAButton
          onClick={() => {
            setOnboarding('bio', bio);
            navigate('/onboarding/geolocation');
          }}
        >
          Continuer
        </CTAButton>
        <button
          type="button"
          className="skip-link"
          onClick={() => navigate('/onboarding/geolocation')}
        >
          Passer cette étape
        </button>
      </div>
    </div>
  );
}
