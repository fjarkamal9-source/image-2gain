import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const STEPS = [
  'welcome-rules', 'first-name', 'welcome-personalized', 'birth-date',
  'gender', 'looking-for-gender', 'sports', 'niveau', 'frequency',
  'max-distance', 'intentions', 'photo', 'bio', 'geolocation', 'motivation-final',
];

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.split('/').pop();
  const idx = STEPS.indexOf(current);
  const progress = idx >= 0 ? ((idx + 1) / STEPS.length) * 100 : 0;
  const isMotivationFinal = current === 'motivation-final' || location.pathname.includes('motivation-final');

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      background: isMotivationFinal ? 'transparent' : undefined,
      backgroundImage: isMotivationFinal ? 'none' : 'url(/img/ecran-b.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'top center',
    }}>
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '0 20px',
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
          paddingBottom: 8,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}>
          <div style={{
            height: 4,
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
