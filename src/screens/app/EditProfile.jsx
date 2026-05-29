import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/ui/BackButton';
import AvatarImage from '../../components/ui/AvatarImage';
import CTAButton from '../../components/ui/CTAButton';
import { useAuth } from '../../hooks/useAuth';
import { getSession } from '../../utils/storage';
import {
  fetchEditableProfile,
  saveProfileEdit,
  uploadProfileAvatar,
} from '../../utils/profileEdit';

const SPORTS = [
  'Musculation', 'Running', 'Fitness', 'Yoga', 'CrossFit', 'Natation',
  'Cyclisme', 'Boxe', 'Danse', 'Escalade', 'Tennis', 'Football',
  'Basketball', 'Padel', 'Golf', 'Randonnée', 'Ski', 'Surf', 'Pilates', 'HIIT',
];

const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'];
const FREQUENCES = ['1x/sem', '2x/sem', '3x/sem', '4x/sem', '5x/sem'];

const INTENTIONS = [
  { emoji: '🏋️', label: 'Partenaire sportif' },
  { emoji: '🧡', label: 'Romance sportive' },
  { emoji: '🤝', label: 'Rencontre amicale' },
  { emoji: '🔥', label: "Le plaisir d'une séance" },
  { emoji: '🎯', label: 'On verra si tu me suis' },
  { emoji: '📅', label: 'Événements sportifs' },
];

function getUserId(user) {
  return user?.id || getSession()?.id || null;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef(null);
  const userId = getUserId(user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [prenom, setPrenom] = useState('');
  const [ville, setVille] = useState('');
  const [bio, setBio] = useState('');
  const [maxDistance, setMaxDistance] = useState(25);
  const [sports, setSports] = useState([]);
  const [intentions, setIntentions] = useState([]);
  const [niveau, setNiveau] = useState('');
  const [frequence, setFrequence] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { profile } = await fetchEditableProfile(userId);
      if (cancelled) return;
      setPhotoUrl(profile.photo_url || '');
      setPrenom(profile.prenom || '');
      setVille(profile.ville || '');
      setBio(profile.bio || '');
      setMaxDistance(profile.max_distance ?? 25);
      setSports(profile.sports || []);
      setIntentions(profile.intentions || []);
      setNiveau(profile.niveau || '');
      setFrequence(profile.frequence || '');
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleSport = (sport) => {
    setSports((prev) => {
      if (prev.includes(sport)) return prev.filter((s) => s !== sport);
      if (prev.length >= 3) return prev;
      return [...prev, sport];
    });
  };

  const toggleIntention = (label) => {
    setIntentions((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const onPhotoChange = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadProfileAvatar(userId, file);
      setPhotoUrl(url);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const result = await saveProfileEdit(userId, {
      prenom,
      ville,
      bio,
      sports,
      intentions,
      niveau,
      frequence,
      max_distance: maxDistance,
      photo_url: photoUrl,
    });

    setSaving(false);

    if (result.ok) {
      setSaved(true);
      window.setTimeout(() => {
        navigate('/profile');
      }, 1400);
    }
  };

  return (
    <div className="app-frame edit-profile-screen">
      <header className="edit-profile-header">
        <BackButton />
        <h1>Modifier mon profil</h1>
        <span className="edit-profile-header__spacer" />
      </header>

      {loading ? (
        <p className="edit-profile-loading">Chargement…</p>
      ) : (
        <div className="edit-profile-body">
          <section className="edit-section">
            <h2 className="edit-section__title">Photo</h2>
            <div className="edit-photo-row">
              <AvatarImage src={photoUrl} name={prenom || '?'} size={72} />
              <button
                type="button"
                className="edit-photo-btn"
                disabled={uploadingPhoto}
                onClick={() => fileRef.current?.click()}
              >
                {uploadingPhoto ? 'Envoi…' : 'Changer la photo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onPhotoChange(e.target.files?.[0])}
              />
            </div>
          </section>

          <section className="edit-section">
            <h2 className="edit-section__title">Infos</h2>
            <label className="edit-label">Prénom</label>
            <input
              className="edit-input edit-input--title"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              maxLength={30}
            />
            <label className="edit-label">Ville</label>
            <input
              className="edit-input"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
            />
            <label className="edit-label">Bio</label>
            <textarea
              className="bio-textarea"
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présente-toi en quelques mots…"
            />
            <p className="bio-counter">{bio.length}/150</p>
          </section>

          <section className="edit-section">
            <h2 className="edit-section__title">Distance max</h2>
            <p className="distance-value">{maxDistance} km</p>
            <input
              type="range"
              min={1}
              max={100}
              value={maxDistance}
              className="distance-slider"
              onChange={(e) => setMaxDistance(Number(e.target.value))}
            />
          </section>

          <section className="edit-section">
            <h2 className="edit-section__title">Sport</h2>
            <p className="edit-hint">Jusqu&apos;à 3 sports</p>
            <div className="sports-tags">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  className={`sport-tag ${sports.includes(sport) ? 'sport-tag--selected' : ''}`}
                  onClick={() => toggleSport(sport)}
                >
                  {sport}
                </button>
              ))}
            </div>
          </section>

          <section className="edit-section">
            <h2 className="edit-section__title">Niveau</h2>
            <div className="pill-select-row">
              {NIVEAUX.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`pill-select ${niveau === n ? 'pill-select--active' : ''}`}
                  onClick={() => setNiveau(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          <section className="edit-section">
            <h2 className="edit-section__title">Fréquence</h2>
            <div className="pill-select-row pill-select-row--wrap">
              {FREQUENCES.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`pill-select ${frequence === f ? 'pill-select--active' : ''}`}
                  onClick={() => setFrequence(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>

          <section className="edit-section">
            <h2 className="edit-section__title">Objectif</h2>
            <div className="intentions-grid">
              {INTENTIONS.map(({ emoji, label }) => (
                <button
                  key={label}
                  type="button"
                  className={`intention-card ${intentions.includes(label) ? 'intention-card--selected' : ''}`}
                  onClick={() => toggleIntention(label)}
                >
                  <span className="intention-emoji">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="edit-profile-footer">
        {saved && <p className="edit-save-feedback">Sauvegardé ✓</p>}
        <CTAButton disabled={loading || saving} onClick={handleSave}>
          {saving ? 'Enregistrement…' : 'Sauvegarder'}
        </CTAButton>
      </div>
    </div>
  );
}
