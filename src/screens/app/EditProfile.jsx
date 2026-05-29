import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/ui/BackButton';
import AvatarImage from '../../components/ui/AvatarImage';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, getOnboardingJSON } from '../../utils/storage';
import {
  getProfilePhotoUrl,
  saveProfileEdit,
  setProfilePhotoUrl,
} from '../../utils/profileEdit';
import { getUserProfile } from '../../utils/completeOnboarding';

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

export default function EditProfile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const profile = getUserProfile();

  const [photoUrl, setPhotoUrl] = useState(getProfilePhotoUrl());
  const [prenom, setPrenom] = useState(getOnboarding('prenom') || profile?.prenom || '');
  const [ville, setVille] = useState(getOnboarding('ville') || profile?.ville || '');
  const [bio, setBio] = useState(getOnboarding('bio') || profile?.bio || '');
  const [sports, setSports] = useState(
    getOnboardingJSON('sports', [])?.length
      ? getOnboardingJSON('sports', [])
      : profile?.sports || []
  );
  const [intentions, setIntentions] = useState(
    getOnboardingJSON('intentions', [])?.length
      ? getOnboardingJSON('intentions', [])
      : profile?.intentions || []
  );
  const [niveau, setNiveau] = useState(getOnboarding('niveau') || profile?.niveau || '');
  const [frequence, setFrequence] = useState(getOnboarding('frequence') || profile?.frequence || '');

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

  const onPhotoChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPhotoUrl(dataUrl);
      setProfilePhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveProfileEdit({
      prenom: prenom.trim(),
      ville: ville.trim(),
      bio: bio.trim(),
      sports,
      intentions,
      niveau,
      frequence,
    });
    navigate('/profile');
  };

  return (
    <div className="app-frame edit-profile-screen">
      <header className="edit-profile-header">
        <BackButton />
        <h1>Modifier mon profil</h1>
        <span className="edit-profile-header__spacer" />
      </header>

      <div className="edit-profile-body">
        <section className="edit-section">
          <h2 className="edit-section__title">Photo</h2>
          <div className="edit-photo-row">
            <AvatarImage src={photoUrl} name={prenom || '?'} size={72} />
            <button
              type="button"
              className="edit-photo-btn"
              onClick={() => fileRef.current?.click()}
            >
              Changer la photo
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

      <div className="edit-profile-footer">
        <CTAButton onClick={handleSave}>Sauvegarder</CTAButton>
      </div>
    </div>
  );
}
