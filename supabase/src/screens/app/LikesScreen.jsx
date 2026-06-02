import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/layout/AppHeader';
import AvatarImage from '../../components/ui/AvatarImage';
import { getAvatarColor } from '../../data/mockProfiles';
import { useAuth } from '../../hooks/useAuth';
import { useLikesBadge } from '../../context/LikesBadgeContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { fetchLikesReceived, fetchLikesSent } from '../../utils/likesStorage';
function getCurrentUserId(user) {
  return user?.id ?? null;
}

export default function LikesScreen() {
  const { user } = useAuth();
  const { markSeen, refreshUnseenCount } = useLikesBadge();
  const [tab, setTab] = useState('recus');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLikes = useCallback(async () => {
    const uid = getCurrentUserId(user);
    setLoading(true);
    const [rec, snt] = await Promise.all([
      fetchLikesReceived(uid),
      fetchLikesSent(uid),
    ]);
    setReceived(rec);
    setSent(snt);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  useEffect(() => {
    markSeen();
    refreshUnseenCount();
  }, [markSeen, refreshUnseenCount]);

  useEffect(() => {
    const uid = getCurrentUserId(user);
    if (!isSupabaseConfigured || !supabase || !uid) return undefined;

    const channel = supabase
      .channel(`likes-screen-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `receiver_id=eq.${uid}`,
        },
        () => {
          loadLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadLikes]);

  const list = tab === 'recus' ? received : sent;

  return (
    <div className="likes-screen">
      <AppHeader showAvatar={false} />
      <div className="likes-tabs">
        <button
          type="button"
          className={`likes-tab ${tab === 'recus' ? 'likes-tab--active' : ''}`}
          onClick={() => setTab('recus')}
        >
          Reçus
        </button>
        <button
          type="button"
          className={`likes-tab ${tab === 'envoyes' ? 'likes-tab--active' : ''}`}
          onClick={() => setTab('envoyes')}
        >
          Envoyés
        </button>
      </div>
      {loading ? (
        <div className="likes-empty">
          <p className="likes-empty-sub">Chargement…</p>
        </div>
      ) : list.length > 0 ? (
        <div className="likes-grid">
          {list.map((p) => (
            <Link
              key={p.likeId || p.id}
              to={`/profile/${p.id}`}
              className="likes-cell"
              style={{ backgroundColor: getAvatarColor(p.prenom) }}
            >
              <div className="likes-cell__media">
                <AvatarImage
                  src={p.photo}
                  name={p.prenom}
                  size={120}
                  className="likes-cell__avatar"
                />
              </div>
              <span className="likes-cell__name">{p.prenom}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="likes-empty">
          <div className="likes-empty-icon">♥</div>
          <p className="likes-empty-title">
            {tab === 'recus'
              ? "Personne n'a encore liké ton profil"
              : "Tu n'as pas encore liké de profil"}
          </p>
          <p className="likes-empty-sub">
            {tab === 'recus'
              ? 'Continue de swiper pour augmenter tes chances'
              : 'Commence à swiper pour trouver ton partenaire'}
          </p>
        </div>
      )}
    </div>
  );
}
