import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/ui/BackButton';
import Toggle from '../../components/ui/Toggle';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import {
  getDiscoverySettings,
  setSettingsAgeMax,
  setSettingsAgeMin,
  setSettingsDistance,
  setSettingsNiveau,
} from '../../utils/settingsStorage';

const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé', ''];

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const initial = getDiscoverySettings();

  const [distance, setDistance] = useState(initial.distance);
  const [ageMin, setAgeMin] = useState(initial.ageMin);
  const [ageMax, setAgeMax] = useState(initial.ageMax);
  const [niveau, setNiveau] = useState(initial.niveau || '');
  const [notifs, setNotifs] = useState({
    match: true,
    message: true,
    like: true,
    event: false,
  });

  const updateDistance = (v) => {
    setDistance(v);
    setSettingsDistance(v);
  };

  const updateAgeMin = (v) => {
    setAgeMin(v);
    setSettingsAgeMin(v);
  };

  const updateAgeMax = (v) => {
    setAgeMax(v);
    setSettingsAgeMax(v);
  };

  const updateNiveau = (v) => {
    setNiveau(v);
    if (v) setSettingsNiveau(v);
    else localStorage.removeItem('settings_niveau');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="settings-screen">
      <header className="settings-header">
        <BackButton />
        <h1>Paramètres</h1>
      </header>
      <section className="settings-section">
        <h2>MON COMPTE</h2>
        <button type="button" className="settings-row" onClick={() => navigate('/profile/edit')}>
          Modifier profil
        </button>
        <button type="button" className="settings-row" onClick={() => navigate('/profile/edit')}>
          Photos
        </button>
        <button type="button" className="settings-row">Email</button>
        <button type="button" className="settings-row">Téléphone</button>
      </section>
      <section className="settings-section">
        <h2>DÉCOUVERTE</h2>
        <label className="settings-slider-row">
          Distance max : {distance} km
          <input
            type="range"
            min={1}
            max={100}
            value={distance}
            onChange={(e) => updateDistance(Number(e.target.value))}
          />
        </label>
        <label className="settings-slider-row">
          Âge minimum : {ageMin} ans
          <input
            type="range"
            min={18}
            max={60}
            value={ageMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateAgeMin(Math.min(v, ageMax));
            }}
          />
        </label>
        <label className="settings-slider-row">
          Âge maximum : {ageMax} ans
          <input
            type="range"
            min={18}
            max={60}
            value={ageMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateAgeMax(Math.max(v, ageMin));
            }}
          />
        </label>
        <p className="edit-hint" style={{ marginTop: 12 }}>Niveau sportif</p>
        <div className="pill-select-row pill-select-row--wrap">
          <button
            type="button"
            className={`pill-select ${!niveau ? 'pill-select--active' : ''}`}
            onClick={() => updateNiveau('')}
          >
            Tous
          </button>
          {NIVEAUX.filter(Boolean).map((n) => (
            <button
              key={n}
              type="button"
              className={`pill-select ${niveau === n ? 'pill-select--active' : ''}`}
              onClick={() => updateNiveau(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </section>
      <section className="settings-section">
        <h2>NOTIFICATIONS</h2>
        <Toggle label="Nouveaux matchs" checked={notifs.match} onChange={(v) => setNotifs((n) => ({ ...n, match: v }))} />
        <Toggle label="Messages" checked={notifs.message} onChange={(v) => setNotifs((n) => ({ ...n, message: v }))} />
        <Toggle label="Likes reçus" checked={notifs.like} onChange={(v) => setNotifs((n) => ({ ...n, like: v }))} />
        <Toggle label="Événements" checked={notifs.event} onChange={(v) => setNotifs((n) => ({ ...n, event: v }))} />
      </section>
      <section className="settings-section">
        <h2>CONFIDENTIALITÉ</h2>
        <button type="button" className="settings-row">Visibilité du profil</button>
        <button type="button" className="settings-row">Bloquer des utilisateurs</button>
        <button type="button" className="settings-row">Données personnelles</button>
      </section>
      <section className="settings-section">
        <h2>PREMIUM</h2>
        <button
          type="button"
          className="settings-row settings-row--premium"
          onClick={() => navigate('/premium')}
        >
          Devenir Premium
        </button>
      </section>
      <section className="settings-section">
        <h2>COMPTE</h2>
        <button type="button" className="settings-row settings-row--danger" onClick={handleLogout}>
          Se déconnecter
        </button>
        <button type="button" className="settings-row settings-row--danger">
          Supprimer mon compte
        </button>
      </section>
    </div>
  );
}
