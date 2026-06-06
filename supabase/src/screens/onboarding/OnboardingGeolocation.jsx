import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { setOnboarding } from '../../utils/storage';

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || '';
  } catch {
    return '';
  }
}

export default function OnboardingGeolocation() {
  const navigate = useNavigate();
  const [showManual, setShowManual] = useState(false);
  const [manualCity, setManualCity] = useState('');

  const allow = () => {
    if (!navigator.geolocation) {
      // Cas technique : géoloc non supportée → saisie manuelle
      setShowManual(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.error('Coordonnées GPS invalides');
          setShowManual(true);
          return;
        }
        const ville = await reverseGeocode(lat, lng);
        setOnboarding('ville', ville);
        // Données sensibles : lat/lng stockés en localStorage — ne pas logger ces valeurs
        setOnboarding('lat', lat);
        setOnboarding('lng', lng);
        navigate('/onboarding/motivation-final');
      },
      () => {
        // Refus utilisateur → saisie manuelle
        setShowManual(true);
      }
    );
  };

  const confirmManual = () => {
    setOnboarding('ville', manualCity.trim() || 'Non renseignée');
    setOnboarding('lat', null);
    setOnboarding('lng', null);
    navigate('/onboarding/motivation-final');
  };

  if (showManual) {
    return (
      <div className="onboarding-page onboarding-page--center">
        <h1 className="onboarding-title">Quelle est ta ville ?</h1>
        <p className="onboarding-sub">Pour trouver des sportifs près de toi</p>
        <input
          type="text"
          className="bio-textarea"
          style={{ height: 'auto', padding: '14px 16px', fontSize: 16 }}
          placeholder="Entrez votre ville"
          value={manualCity}
          onChange={(e) => setManualCity(e.target.value)}
        />
        <div className="onboarding-footer">
          <CTAButton onClick={confirmManual}>Confirmer</CTAButton>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page onboarding-page--center">
      <h1 className="onboarding-title">Active ta localisation</h1>
      <p className="onboarding-sub">Pour trouver des sportifs autour de toi</p>
      <div className="geo-pin-circle">📍</div>
      <div className="geo-info-card">
        <p>2GAIN utilise ta position uniquement pour calculer les distances.</p>
        <p className="geo-muted">Jamais partagée.</p>
      </div>
      <div className="onboarding-footer">
        <CTAButton onClick={allow}>Autoriser la localisation</CTAButton>
        <button type="button" className="skip-link" onClick={() => setShowManual(true)}>
          Saisir ma ville manuellement
        </button>
      </div>
    </div>
  );
}
