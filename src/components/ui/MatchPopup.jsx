import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarImage from './AvatarImage';
import CTAButton from './CTAButton';
import { useProfile } from '../../hooks/useProfile';

export default function MatchPopup({ matchProfile, onClose }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [step, setStep] = useState(0);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 400),
      setTimeout(() => setStep(3), 600),
      setTimeout(() => setStep(4), 800),
      setTimeout(() => {
        setStep(5);
        const pieces = Array.from({ length: 48 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          color: ['#FF6B00', '#1A3FCC', '#2ECC71', '#fff'][i % 4],
        }));
        setConfetti(pieces);
      }, 1000),
      setTimeout(() => setStep(6), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!matchProfile) return null;

  return (
    <div className="match-overlay" role="dialog" aria-modal="true">
      {step >= 5 &&
        confetti.map((c) => (
          <span
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              background: c.color,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      <div className="match-content">
        {step >= 1 && <p className="match-line1">C&apos;EST UN</p>}
        {step >= 2 && <p className="match-line2">MATCH ! 💪</p>}
        {step >= 3 && (
          <div className="match-avatars">
            <AvatarImage src={profile?.photo_url} name={profile?.prenom} size={72} />
            <AvatarImage src={matchProfile.photo} name={matchProfile.prenom} size={72} />
          </div>
        )}
        {step >= 4 && (
          <p className="match-sub">
            Toi et {matchProfile.prenom} avez liké vos profils
          </p>
        )}
        {step >= 6 && (
          <div className="match-actions">
            <CTAButton onClick={() => navigate(`/chat/${matchProfile.matchId || matchProfile.id}`)}>
              Envoyer un message
            </CTAButton>
            <button type="button" className="match-continue" onClick={onClose}>
              Continuer à swiper
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
