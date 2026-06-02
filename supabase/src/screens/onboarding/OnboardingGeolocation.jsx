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
    return data.address?.city || data.address?.town || data.address?.village || 'Besançon';
  } catch {
    return 'Besançon';
  }
}

export default function OnboardingGeolocation() {
  const navigate = useNavigate();

  const allow = () => {
    if (!navigator.geolocation) {
      setOnboarding('ville', 'Besançon');
      setOnboarding('lat', 47.2378);
      setOnboarding('lng', 6.0241);
      navigate('/onboarding/motivation-final');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.error('Coordonnées GPS invalides :', lat, lng);
          navigate('/onboarding/motivation-final');
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
        setOnboarding('ville', 'Besançon');
        setOnboarding('lat', 47.2378);
        setOnboarding('lng', 6.0241);
        navigate('/onboarding/motivation-final');
      }
    );
  };

  const skip = () => {
    setOnboarding('ville', 'Besançon');
    setOnboarding('lat', 47.2378);
    setOnboarding('lng', 6.0241);
    navigate('/onboarding/motivation-final');
  };

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
        <button type="button" className="skip-link" onClick={skip}>
          Passer cette étape
        </button>
      </div>
    </div>
  );
}
