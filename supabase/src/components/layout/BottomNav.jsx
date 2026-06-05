import { NavLink } from 'react-router-dom';
import { useLikesBadge } from '../../context/LikesBadgeContext';

/** Découvrir — loupe (Search) */
function IconSearch({ active }) {
  const c = active ? '#FF6B00' : '#AAAAAA';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke={c} strokeWidth="1.9" />
      <line x1="16" y1="16" x2="21" y2="21" stroke={c} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** Maps — boussole (Compass) */
function IconCompass({ active }) {
  const c = active ? '#1A3FCC' : '#AAAAAA';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke={c} strokeWidth="1.8" />
      <polygon points="16,8 13.5,13.5 8,16 10.5,10.5" fill={c} />
    </svg>
  );
}

/** Match — cœur plein (bleu inactif, orange actif) */
function IconHeart({ active }) {
  const c = active ? '#FF6B00' : '#1A3FCC';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.5-7-9.5C5 7 7.5 5 10 5c1.5 0 3 1 2 2.5C13 6 14.5 5 16 5c2.5 0 5 2 5 5.5S12 20 12 20z"
        fill={c}
      />
    </svg>
  );
}

/** Messages — bulle ronde (MessageCircle) */
function IconMessageCircle({ active }) {
  const c = active ? '#FF6B00' : '#AAAAAA';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? '#FF6B00' : 'none'}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

const TABS = [
  { to: '/home', label: 'Découvrir', Icon: IconSearch, end: true },
  { to: '/maps', label: 'Maps', Icon: IconCompass },
  { to: '/likes', label: 'Match', Icon: IconHeart },
  { to: '/chat', label: 'Messages', Icon: IconMessageCircle },
];

export default function BottomNav() {
  const { unseenCount } = useLikesBadge();
  const badgeLabel = unseenCount > 9 ? '9+' : String(unseenCount);

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav__tab ${isActive ? 'bottom-nav__tab--active' : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="bottom-nav__bar" />}
              <span className="bottom-nav__icon-wrap">
                <Icon active={isActive} />
                {label === 'Match' && unseenCount > 0 && (
                  <span className="bottom-nav__badge" aria-label={`${unseenCount} nouveaux likes`}>
                    {badgeLabel}
                  </span>
                )}
              </span>
              <span
                className="bottom-nav__label"
                style={{
                  color: isActive
                    ? label === 'Maps'
                      ? '#1A3FCC'
                      : '#FF6B00'
                    : '#AAAAAA',
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
