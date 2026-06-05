import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import Tag from '../../components/ui/Tag';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { getVenuesLiked } from '../../utils/venuesStorage';
import { getOnboarding } from '../../utils/storage';
import { getProfilePhotoUrl, getProfileTags } from '../../utils/profileEdit';
import { venues } from '../../data/venues';

function SettingsGear() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
        stroke="#666"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="#666"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ProfileTag({ type, value, placeholder }) {
  if (!value) {
    return <span className="tag-placeholder">{placeholder}</span>;
  }
  return <Tag type={type}>{value}</Tag>;
}

export default function MyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, completion } = useProfile();
  const likedVenues = getVenuesLiked(venues);
  const { objectifs, sports, niveau, frequence } = getProfileTags(profile);

  const [likesRecus, setLikesRecus] = useState(0);
  const [matchsActifs, setMatchsActifs] = useState(0);
  const sessionsPlanif = 0;

  useEffect(() => {
    const uid = user?.id;
    if (!uid || !isSupabaseConfigured || !supabase) return;

    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', uid)
      .then(({ count }) => { if (count != null) setLikesRecus(count); });

    supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .or(`user_a.eq.${uid},user_b.eq.${uid}`)
      .then(({ count }) => { if (count != null) setMatchsActifs(count); });
  }, [user]);

  const prenom = profile?.prenom || 'K';
  const age = profile?.age || 28;
  const photoUrl = getProfilePhotoUrl();

  const stats = [
    { label: 'Likes reçus', value: likesRecus },
    { label: 'Matchs actifs', value: matchsActifs },
    { label: 'Sessions planif.', value: sessionsPlanif },
  ];

  return (
    <div className="profile-screen">
      <header className="profile-top-header">
        <h1>Mon Profil</h1>
        <Link to="/settings" className="profile-settings-btn" aria-label="Réglages">
          <SettingsGear />
        </Link>
      </header>
      <div
        className="profile-hero"
        style={{
          width: '100%',
          height: 280,
          position: 'relative',
          backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
          backgroundColor: photoUrl ? 'transparent' : '#1A3FCC22',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            color: '#fff',
          }}
        >
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            {prenom}{age ? `, ${age} ans` : ''}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 14, opacity: 0.85 }}>
            {profile?.ville || ''}
            {profile?.max_distance ? ` · ${profile.max_distance} km max` : ''}
          </p>
        </div>
      </div>
      {completion < 100 && (
        <div className="profile-completion">
          <p>
            Profil complet à <span className="text-orange">{completion}%</span>
          </p>
          <div className="profile-completion-bar">
            <div style={{ width: `${completion}%` }} />
          </div>
          <div className="profile-tip">
            <span>💡 Ajoute une photo → +60% de matchs</span>
            <Link to="/profile/edit">Compléter →</Link>
          </div>
        </div>
      )}
      <div className="profile-tags-row">
        <ProfileTag type="objectif" value={objectifs[0]} placeholder="Ton objectif" />
        <ProfileTag type="sport" value={sports[0]} placeholder="Ton sport" />
        <ProfileTag type="niveau" value={niveau} placeholder="Niveau" />
        <ProfileTag type="frequence" value={frequence} placeholder="Fréquence" />
      </div>
      <section className="profile-section">
        <div className="profile-section__head">
          <h2>À propos</h2>
          <button type="button" className="link-blue" onClick={() => navigate('/profile/edit')}>
            Modifier
          </button>
        </div>
        <p className={(getOnboarding('bio') || profile?.bio) ? 'profile-bio-text' : 'profile-bio-placeholder'}>
          {getOnboarding('bio') || profile?.bio || 'Ajoute une bio pour te présenter'}
        </p>
      </section>
      <div className="profile-stats">
        {stats.map(({ label, value }) => (
          <div key={label} className="profile-stat-card">
            <span className="profile-stat-val">{value}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="profile-section">
        <h2>Lieux likés</h2>
        {likedVenues.length > 0 ? (
          <div className="venues-liked-pills">
            {likedVenues.map((v) => (
              <span key={v.venue_id || v.venue_name} className="venue-liked-pill">
                {v.venue_name}
              </span>
            ))}
          </div>
        ) : (
          <p className="profile-venues-empty">Aucun lieu liké pour l&apos;instant</p>
        )}
      </section>
      <div className="profile-actions">
        <CTAButton onClick={() => navigate('/profile/edit')}>Modifier mon profil</CTAButton>
        <Link to="/settings">
          <CTAButton variant="secondary">Réglages</CTAButton>
        </Link>
      </div>
    </div>
  );
}
