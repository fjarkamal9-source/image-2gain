import { Outlet, useLocation } from 'react-router-dom';
import ProgressBar from '../ui/ProgressBar';
import BackButton from '../ui/BackButton';

const STEPS = [
  'email',
  'welcome-rules',
  'first-name',
  'welcome-personalized',
  'birth-date',
  'gender',
  'looking-for-gender',
  'max-distance',
  'intentions',
  'sports',
  'photo',
  'bio',
  'geolocation',
  'motivation-final',
];

export default function OnboardingLayout() {
  const { pathname } = useLocation();
  const slug = pathname.split('/').pop();
  const idx = STEPS.indexOf(slug);
  const progress = idx >= 0 ? ((idx + 1) / STEPS.length) * 100 : 0;
  const hideBack = slug === 'motivation-final';

  return (
    <div
      className="app-frame onboarding-frame"
      style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}
    >
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
          opacity: 0.12,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ProgressBar value={progress} />
        {!hideBack && (
          <div className="onboarding-back">
            <BackButton />
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
