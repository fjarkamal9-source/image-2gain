import { NavLink } from 'react-router-dom';
import { useLikesBadge } from '../../context/LikesBadgeContext';

function IconFlame({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22c4-3 7-7 7-11a7 7 0 0 0-14 0c0 4 3 8 7 11z"
        fill={active ? '#FF6B00' : '#AAAAAA'}
      />
      <path d="M12 14c-1.5-2-2-4-2-6 2 1 3 3 3 5 0-2 1-4 3-5 0 2-.5 4-2 6z" fill="#fff" opacity="0.5" />
    </svg>
  );
}

function IconEye({ active }) {
  const c = active ? '#1A3FCC' : '#AAAAAA';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke={c} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" fill={c} />
    </svg>
  );
}

function IconHeart({ active }) {
  const c = active ? '#1A3FCC' : '#AAAAAA';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.5-7-9.5C5 7 7.5 5 10 5c1.5 0 3 1 2 2.5C13 6 14.5 5 16 5c2.5 0 5 2 5 5.5S12 20 12 20z"
        fill={c}
      />
    </svg>
  );
}

function IconChat({ active }) {
  const c = active ? '#FF6B00' : '#AAAAAA';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V7a2 2 0 0 1 2-2z"
        fill={c}
      />
    </svg>
  );
}

const TABS = [
  { to: '/home', label: 'Go', Icon: IconFlame, end: true },
  { to: '/maps', label: 'Maps', Icon: IconEye },
  { to: '/likes', label: 'Likes', Icon: IconHeart },
  { to: '/chat', label: 'Chat', Icon: IconChat },
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
                {label === 'Likes' && unseenCount > 0 && (
                  <span className="bottom-nav__badge" aria-label={`${unseenCount} nouveaux likes`}>
                    {badgeLabel}
                  </span>
                )}
              </span>
              <span
                className="bottom-nav__label"
                style={{
                  color: isActive
                    ? label === 'Maps' || label === 'Likes'
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
