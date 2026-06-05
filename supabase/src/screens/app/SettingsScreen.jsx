import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/ui/BackButton';
import Toggle from '../../components/ui/Toggle';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import {
  fetchProfileSettings,
  saveProfileSettings,
} from '../../utils/profileSettings';
import {
  getDiscoverySettings,
  setSettingsAgeMax,
  setSettingsAgeMin,
} from '../../utils/settingsStorage';

const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'];
const FREQUENCES = ['1x/sem', '2x/sem', '3x/sem', '4x/sem', '5x/sem'];
const LOOKING_FOR = ['Des hommes', 'Des femmes', 'Tout le monde'];

function getUserId(user) {
  return user?.id ?? null;
}

export default function SettingsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = getUserId(user);
  const ageDefaults = getDiscoverySettings();

  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(25);
  const [lookingFor, setLookingFor] = useState('');
  const [niveau, setNiveau] = useState('');
  const [frequence, setFrequence] = useState('');
  const [pauseMode, setPauseMode] = useState(false);
  const [ageMin, setAgeMin] = useState(ageDefaults.ageMin);
  const [ageMax, setAgeMax] = useState(ageDefaults.ageMax);
  const [notifs, setNotifs] = useState({
    match: true,
    message: true,
    like: true,
    event: false,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const settings = await fetchProfileSettings(userId);
      if (cancelled) return;
      setDistance(settings.distance);
      setLookingFor(settings.looking_for || '');
      setNiveau(settings.niveau || '');
      setFrequence(settings.frequence || '');
      setPauseMode(!settings.visible);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = useCallback(
    (patch) => {
      saveProfileSettings(userId, patch);
    },
    [userId]
  );

  const updateDistance = (v) => {
    setDistance(v);
    persist({ distance: v });
  };

  const updateLookingFor = (v) => {
    setLookingFor(v);
    persist({ looking_for: v });
  };

  const updateNiveau = (v) => {
    setNiveau(v);
    persist({ niveau: v });
  };

  const updateFrequence = (v) => {
    setFrequence(v);
    persist({ frequence: v });
  };

  const updatePauseMode = (paused) => {
    setPauseMode(paused);
    persist({ visible: !paused });
  };

  const updateAgeMin = (v) => {
    setAgeMin(v);
    setSettingsAgeMin(v);
  };

  const updateAgeMax = (v) => {
    setAgeMax(v);
    setSettingsAgeMax(v);
  };

  async function handleDeleteAccount() {
    if (!window.confirm('Es-tu sûr de vouloir supprimer ton compte ?')) return;

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase.rpc('delete_own_account');
        await supabase.auth.signOut();
      } catch (err) {
        console.error('delete account error:', err);
        return;
      }
    }

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.startsWith('2gain_') || key.startsWith('supabase') || key.startsWith('onboarding_') || key === 'profile_photo_url') {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.startsWith('supabase')) {
        sessionStorage.removeItem(key);
      }
    });
    window.location.href = '/';
  }

  return (
    <div className="settings-screen">
      <header className="settings-header">
        <BackButton />
        <h1>Paramètres</h1>
      </header>

      {loading && <p className="settings-loading">Chargement…</p>}

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
            disabled={loading}
            onChange={(e) => updateDistance(Number(e.target.value))}
          />
        </label>

        <p className="edit-hint" style={{ marginTop: 12 }}>Tu veux rencontrer</p>
        <div className="pill-select-row pill-select-row--wrap">
          {LOOKING_FOR.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`pill-select ${lookingFor === opt ? 'pill-select--active' : ''}`}
              disabled={loading}
              onClick={() => updateLookingFor(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

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

        <p className="edit-hint" style={{ marginTop: 12 }}>Mon niveau sportif</p>
        <div className="pill-select-row pill-select-row--wrap">
          <button
            type="button"
            className={`pill-select ${!niveau ? 'pill-select--active' : ''}`}
            disabled={loading}
            onClick={() => updateNiveau('')}
          >
            —
          </button>
          {NIVEAUX.map((n) => (
            <button
              key={n}
              type="button"
              className={`pill-select ${niveau === n ? 'pill-select--active' : ''}`}
              disabled={loading}
              onClick={() => updateNiveau(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <p className="edit-hint" style={{ marginTop: 12 }}>Ma fréquence d&apos;entraînement</p>
        <div className="pill-select-row pill-select-row--wrap">
          <button
            type="button"
            className={`pill-select ${!frequence ? 'pill-select--active' : ''}`}
            disabled={loading}
            onClick={() => updateFrequence('')}
          >
            —
          </button>
          {FREQUENCES.map((f) => (
            <button
              key={f}
              type="button"
              className={`pill-select ${frequence === f ? 'pill-select--active' : ''}`}
              disabled={loading}
              onClick={() => updateFrequence(f)}
            >
              {f}
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
        <Toggle
          label="Mode pause"
          checked={pauseMode}
          disabled={loading}
          onChange={updatePauseMode}
        />
        <p className="edit-hint">
          {pauseMode
            ? 'Ton profil est masqué : tu n’apparais plus dans la découverte.'
            : 'Ton profil est visible dans la découverte.'}
        </p>
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
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/auth'; }}
          className="settings-row settings-row--danger"
        >
          Se déconnecter
        </button>
        <button type="button" className="settings-row settings-row--danger" onClick={handleDeleteAccount}>
          Supprimer mon compte
        </button>
      </section>
    </div>
  );
}
