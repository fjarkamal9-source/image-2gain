import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../../components/ui/BackButton';
import AvatarImage from '../../components/ui/AvatarImage';
import Tag from '../../components/ui/Tag';
import CTAButton from '../../components/ui/CTAButton';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { addLikeSent, isLikeSent } from '../../utils/likesStorage';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(() => (id ? isLikeSent(id) : false));

  useEffect(() => {
    if (!id || !isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('UserProfile fetch', error);
        setProfile(data ?? null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="app-frame onboarding-page">
        <header className="edit-profile-header">
          <BackButton />
          <h1>Profil</h1>
          <span className="edit-profile-header__spacer" />
        </header>
        <p style={{ padding: 20 }}>Chargement…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-frame onboarding-page">
        <header className="edit-profile-header">
          <BackButton />
          <h1>Profil</h1>
          <span className="edit-profile-header__spacer" />
        </header>
        <p style={{ padding: 20 }}>Profil introuvable.</p>
      </div>
    );
  }

  const handleLike = () => {
    if (liked) return;
    addLikeSent(profile.id);
    setLiked(true);
    navigate(-1);
  };

  const handlePass = () => navigate(-1);

  return (
    <div className="app-frame user-profile-full">
      <header className="edit-profile-header">
        <BackButton />
        <h1>Profil</h1>
        <span className="edit-profile-header__spacer" />
      </header>

      <div className="user-profile-scroll">
        <div className="profile-hero">
          <AvatarImage src={profile.photo_url} name={profile.prenom} size={88} />
          <div className="profile-hero__info">
            <p className="profile-hero__name">
              {profile.prenom}, {profile.age} ans
            </p>
            <p className="profile-hero__loc">
              {profile.ville}
            </p>
          </div>
        </div>

        <div className="profile-tags-row">
          {(profile.sports || []).map((s) => (
            <Tag key={s} type="sport">{s}</Tag>
          ))}
          {profile.niveau && <Tag type="niveau">{profile.niveau}</Tag>}
        </div>

        <section className="profile-section">
          <h2>À propos</h2>
          <p className="profile-bio-placeholder">
            {profile.bio || 'Sportif·ve sur 2GAIN — envie de s\'entraîner ensemble !'}
          </p>
        </section>
      </div>

      <div className="user-profile-actions">
        <CTAButton disabled={liked} onClick={handleLike}>
          {liked ? '✓ Liké' : 'Liker'}
        </CTAButton>
        <CTAButton variant="secondary" onClick={handlePass}>
          Passer
        </CTAButton>
      </div>
    </div>
  );
}
