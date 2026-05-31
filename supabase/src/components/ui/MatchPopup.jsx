import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarImage from './AvatarImage';
import CTAButton from './CTAButton';
import { useProfile } from '../../hooks/useProfile';
import { getProfilePhotoUrl } from '../../utils/profileEdit';

const CONFETTI_COLORS = ['#FF6B00', '#1A3FCC'];

function buildConfetti(count = 72) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 1.8,
    color: CONFETTI_COLORS[i % 2],
    size: 5 + Math.random() * 9,
    round: i % 3 === 0,
    drift: -30 + Math.random() * 60,
  }));
}

export default function MatchPopup({ matchProfile, onClose }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [entered, setEntered] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const myPhoto = profile?.photo_url || getProfilePhotoUrl();
  const myPrenom = profile?.prenom || 'Toi';
  const matchPhoto = matchProfile?.photo || matchProfile?.photo_url || '';
  const matchId = matchProfile?.matchId;

  useEffect(() => {
    setConfetti(buildConfetti());
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMessage = () => {
    if (matchId) {
      onClose();
      navigate(`/chat/${matchId}`);
    }
  };

  if (!matchProfile) return null;

  return (
    <div className={`match-overlay ${entered ? 'match-overlay--visible' : ''}`} role="dialog" aria-modal="true">
      <div className="match-particles" aria-hidden>
        {confetti.map((c) => (
          <span
            key={c.id}
            className={`match-particle ${c.round ? 'match-particle--round' : ''}`}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.round ? c.size : c.size * 1.4,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              ['--drift']: `${c.drift}px`,
            }}
          />
        ))}
      </div>

      <div className={`match-content ${entered ? 'match-content--visible' : ''}`}>
        <p className="match-line1">C&apos;EST UN</p>
        <p className="match-line2">MATCH ! 💪</p>

        <div className="match-avatars">
          <div className="match-avatar-slot match-avatar-slot--me">
            <AvatarImage
              src={myPhoto}
              name={myPrenom}
              size={88}
              className="match-avatar-img"
            />
            <span className="match-avatar-label">{myPrenom}</span>
          </div>
          <div className="match-avatars__badge" aria-hidden>
            ♥
          </div>
          <div className="match-avatar-slot match-avatar-slot--them">
            <AvatarImage
              src={matchPhoto}
              name={matchProfile.prenom}
              size={88}
              className="match-avatar-img"
            />
            <span className="match-avatar-label">{matchProfile.prenom}</span>
          </div>
        </div>

        <p className="match-sub">
          Toi et {matchProfile.prenom} avez liké vos profils
        </p>

        <div className="match-actions">
          <CTAButton disabled={!matchId} onClick={handleMessage}>
            Envoyer un message
          </CTAButton>
          <button type="button" className="match-continue" onClick={onClose}>
            Continuer à swiper
          </button>
        </div>
      </div>
    </div>
  );
}
