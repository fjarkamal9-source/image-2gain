import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const STEPS = [
  'welcome-rules', 'first-name', 'welcome-personalized', 'birth-date',
  'gender', 'looking-for-gender', 'niveau', 'frequency', 'max-distance',
  'intentions', 'sports', 'photo', 'bio', 'geolocation',
];

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.split('/').pop();
  const idx = STEPS.indexOf(current);
  const progress = idx >= 0 ? ((idx + 1) / STEPS.length) * 100 : 0;

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
    }}>
      <img
        src="/img/ecran-b.png"
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 24px', paddingTop: 'env(safe-area-inset-top, 16px)' }}>
          <div style={{
            height: 3,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: 2,
            marginTop: 12,
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: '#FF6B00',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />
          </div>
          {idx > 0 && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                color: '#1A3FCC',
                cursor: 'pointer',
                padding: '12px 0',
                fontWeight: 700,
              }}
            >
              &lt;
            </button>
          )}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
