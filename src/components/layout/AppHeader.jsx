import { Link } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';

export function Logo2GainText({ size = 26 }) {
  return (
    <span
      style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: size }}
      aria-label="2GAIN"
    >
      <span style={{ color: '#1A3FCC' }}>2</span>
      <span style={{ color: '#FF6B00' }}>GAIN</span>
    </span>
  );
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="#666" strokeWidth="1.8" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#666" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AppHeader({ center, showAvatar = true }) {
  const { profile, user } = useProfile();
  const initial = (profile?.prenom || user?.prenom || 'K').charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <Link to="/home" className="app-header__logo">
        <Logo2GainText />
      </Link>
      <div className="app-header__center">{center}</div>
      {showAvatar ? (
        <Link to="/profile" className="app-header__avatar" aria-label="Mon profil">
          {initial}
        </Link>
      ) : (
        <Link to="/profile" className="app-header__profile" aria-label="Mon profil">
          <ProfileIcon />
        </Link>
      )}
    </header>
  );
}
