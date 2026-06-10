import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';

export default function OnboardingPhoto() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(getOnboarding('photo_url', ''));

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setOnboarding('photo_url', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="onboarding-page onboarding-page--center">
      <h1 className="onboarding-title" style={{ color: '#111111', fontWeight: '900' }}>Ajoute ta meilleure photo</h1>
      <p className="onboarding-sub" style={{ color: '#111111', fontWeight: '700' }}>Augmente tes chances avec une belle photo !</p>
      <button
        type="button"
        className="photo-zone"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="" className="photo-preview" />
        ) : (
          <>
            <span className="photo-plus">+</span>
            <span className="photo-label" style={{ color: '#111111', fontWeight: '600' }}>Ajouter une photo</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="onboarding-footer">
        <CTAButton variant="outline" onClick={() => navigate('/onboarding/bio')}>Continuer</CTAButton>
        <button type="button" className="skip-link" style={{ color: '#1A3FCC', fontWeight: '600' }} onClick={() => navigate('/onboarding/bio')}>
          Passer cette étape
        </button>
      </div>
    </div>
  );
}
