import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from '../../components/layout/AppHeader';
import AvatarImage from '../../components/ui/AvatarImage';
import Tag from '../../components/ui/Tag';
import MatchPopup from '../../components/ui/MatchPopup';
import { getAvatarColor, MOCK_PROFILES } from '../../data/mockProfiles';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { getUserProfile } from '../../utils/completeOnboarding';
import { filterDiscoveryProfiles } from '../../utils/discoveryFilter';
import { mapRowToSwipeProfile } from '../../utils/mapSwipeProfile';
import { getDiscoverySettings } from '../../utils/settingsStorage';
import {
  addLikeSent,
  addMatch,
  checkAndCreateMatch,
  pushHideToSupabase,
  pushLikeToSupabase,
  pushPassToSupabase,
  fetchExcludedProfileIds,
} from '../../utils/likesStorage';
import { getSession } from '../../utils/storage';

const THRESHOLD = 90;
const CARD_W = 300;
const CARD_H = 460;

function SwipeCard({ profile, style, innerRef, onPointerDown, children }) {
  const bg = getAvatarColor(profile.prenom);
  return (
    <div
      ref={innerRef}
      className="swipe-card"
      style={{
        ...style,
        width: CARD_W,
        height: CARD_H,
        background: `linear-gradient(180deg, ${bg}88 0%, ${bg} 40%, #000 100%)`,
      }}
      onPointerDown={onPointerDown}
    >
      {children}
      <div className="swipe-card__gradient" />
      <div className="swipe-card__info">
        <p className="swipe-card__name">
          {profile.prenom}, {profile.age} ans
        </p>
        <p className="swipe-card__meta">
          {profile.distance} km · {profile.ville}
        </p>
        <div className="swipe-card__tags">
          <Tag type="objectif">{profile.objectif}</Tag>
          <Tag type="sport">{profile.sport}</Tag>
          <Tag type="niveau">{profile.niveau}</Tag>
        </div>
      </div>
    </div>
  );
}

function getCurrentUserId(user) {
  return user?.id || getSession()?.id || null;
}

export default function HomeSwipe() {
  const location = useLocation();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [matchProfile, setMatchProfile] = useState(null);
  const cardRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0 });
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [excludedIds, setExcludedIds] = useState(() => new Set());
  const [sourceProfiles, setSourceProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [deckVersion, setDeckVersion] = useState(0);

  const refreshDeck = useCallback(() => {
    setDeckVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setProfilesLoading(true);
      const uid = getCurrentUserId(user);
      const excluded = await fetchExcludedProfileIds(uid);
      if (cancelled) return;
      setExcludedIds(excluded);

      if (!isSupabaseConfigured || !supabase) {
        setSourceProfiles(MOCK_PROFILES);
        setProfilesLoading(false);
        return;
      }

      let query = supabase.from('profiles').select('*').limit(20);
      if (uid) {
        query = query.neq('id', uid);
      }

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        console.error('fetch profiles', error);
        setSourceProfiles(MOCK_PROFILES);
      } else {
        const me = getUserProfile();
        const mapped = (data || [])
          .filter((row) => !excluded.has(row.id))
          .map((row) => mapRowToSwipeProfile(row, me?.lat, me?.lng));
        setSourceProfiles(mapped);
      }

      setProfilesLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, location.key, deckVersion]);

  const deck = useMemo(() => {
    const me = getUserProfile();
    return filterDiscoveryProfiles(
      sourceProfiles.length ? sourceProfiles : MOCK_PROFILES,
      getDiscoverySettings(),
      excludedIds,
      me
    );
  }, [sourceProfiles, excludedIds, deckVersion]);
  const visible = deck.slice(index, index + 3);
  const count = deck.length;

  const resetCard = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.style.transform = 'translate(0,0) rotate(0deg)';
    setTimeout(() => {
      if (el) el.style.transition = '';
    }, 350);
  }, []);

  const flyOut = useCallback((dir) => {
    const el = cardRef.current;
    if (!el) return;

    let transform = '';
    if (dir === 'right') {
      transform = 'translate(500px, -40px) rotate(25deg)';
    } else if (dir === 'left') {
      transform = 'translate(-500px, -40px) rotate(-25deg)';
    } else if (dir === 'down') {
      transform = 'translate(0, 500px) rotate(0deg)';
    }

    el.style.transition = 'transform 0.3s ease-out';
    el.style.transform = transform;
    setTimeout(() => {
      setIndex((i) => i + 1);
      if (el) {
        el.style.transition = '';
        el.style.transform = 'translate(0,0) rotate(0deg)';
      }
    }, 300);
  }, []);

  const likeProfile = useCallback(async () => {
    const current = deck[index];
    if (!current) return;

    const senderId = getCurrentUserId(user);
    addLikeSent(current.id);

    if (senderId) {
      await pushLikeToSupabase(senderId, current.id);
      const { matched, matchId } = await checkAndCreateMatch(senderId, current.id);
      if (matched) {
        addMatch(current.id);
        setMatchProfile({ ...current, matchId });
      }
    }

    setExcludedIds((prev) => new Set(prev).add(current.id));
    flyOut('right');
    refreshDeck();
  }, [deck, index, flyOut, user, refreshDeck]);

  const passProfile = useCallback(async () => {
    const current = deck[index];
    if (!current) return;

    const passerId = getCurrentUserId(user);
    if (passerId) {
      await pushPassToSupabase(passerId, current.id);
    }

    setExcludedIds((prev) => new Set(prev).add(current.id));
    flyOut('left');
    refreshDeck();
  }, [deck, index, flyOut, user, refreshDeck]);

  const hideProfile = useCallback(async () => {
    const current = deck[index];
    if (!current) return;

    const hiderId = getCurrentUserId(user);
    if (hiderId) {
      await pushHideToSupabase(hiderId, current.id);
    }

    setExcludedIds((prev) => new Set(prev).add(current.id));
    flyOut('down');
    refreshDeck();
  }, [deck, index, flyOut, user, refreshDeck]);

  const onPointerDown = (e) => {
    const el = cardRef.current;
    if (!el || !deck[index]) return;
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, dx: 0 };
    el.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      if (!dragRef.current.active) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setDragX(dx);
      setDragY(dy);
      const rot = dx / 12;
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    };

    const onUp = (evUp) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      const dx = evUp.clientX - dragRef.current.startX;
      const dy = evUp.clientY - dragRef.current.startY;
      setDragX(0);
      setDragY(0);
      el.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      if (dy >= THRESHOLD) {
        hideProfile();
      } else if (dx >= THRESHOLD) {
        likeProfile();
      } else if (dx <= -THRESHOLD) {
        passProfile();
      } else {
        resetCard();
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const showLike = dragX > 20 && dragY < THRESHOLD / 2;
  const showPass = dragX < -20 && dragY < THRESHOLD / 2;
  const showHide = dragY > 20;

  return (
    <div className="home-swipe">
      <AppHeader
        center={
          <span className="home-counter">
            {count} sportifs près de toi
          </span>
        }
      />
      <div className="card-stack">
        {profilesLoading ? (
          <p className="empty-deck">Chargement des profils…</p>
        ) : visible.length === 0 ? (
          <p className="empty-deck">Plus de profils pour le moment. Reviens plus tard !</p>
        ) : (
          visible.map((p, i) => {
            const scale = 1 - i * 0.04;
            const isTop = i === 0;
            const nextThree = deck.slice(index + 1, index + 4);
            return (
              <SwipeCard
                key={p.id}
                profile={p}
                innerRef={isTop ? cardRef : null}
                onPointerDown={isTop ? onPointerDown : undefined}
                style={{
                  zIndex: 10 - i,
                  transform: `scale(${scale}) translateY(${i * 8}px)`,
                  pointerEvents: isTop ? 'auto' : 'none',
                }}
              >
                {isTop && (
                  <>
                    <div className="mini-avatars">
                      {nextThree.map((n) => (
                        <div key={n.id} className="mini-avatar-item">
                          <AvatarImage src={n.photo} name={n.prenom} size={28} />
                          <span>{n.prenom}</span>
                        </div>
                      ))}
                    </div>
                    {showHide && (
                      <span className="swipe-label swipe-label--hide">CACHER</span>
                    )}
                    {showLike && <span className="swipe-label swipe-label--like">LIKE</span>}
                    {showPass && <span className="swipe-label swipe-label--pass">PASS</span>}
                  </>
                )}
              </SwipeCard>
            );
          })
        )}
      </div>
      <div className="swipe-actions">
        <button type="button" className="swipe-btn swipe-btn--pass" onClick={passProfile} aria-label="Passer">
          ✕
        </button>
        <button type="button" className="swipe-btn swipe-btn--like" onClick={likeProfile} aria-label="Like">
          ♡
        </button>
      </div>
      {matchProfile && (
        <MatchPopup matchProfile={matchProfile} onClose={() => setMatchProfile(null)} />
      )}
    </div>
  );
}
