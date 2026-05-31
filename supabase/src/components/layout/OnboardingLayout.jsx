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
    <div className="app-frame onboarding-frame">
      <ProgressBar value={progress} />
      {!hideBack && (
        <div className="onboarding-back">
          <BackButton />
        </div>
      )}
      <Outlet />
    </div>
  );
}
