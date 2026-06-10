import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import OnboardingLayout from './components/layout/OnboardingLayout';
import AuthScreen from './screens/AuthScreen';
import AuthCallback from './screens/AuthCallback';

const WelcomeNewUser = React.lazy(() => import('./screens/WelcomeNewUser'));
const OnboardingWelcomeRules = React.lazy(() => import('./screens/onboarding/OnboardingWelcomeRules'));
const OnboardingFirstName = React.lazy(() => import('./screens/onboarding/OnboardingFirstName'));
const OnboardingWelcomePersonalized = React.lazy(() => import('./screens/onboarding/OnboardingWelcomePersonalized'));
const OnboardingBirthDate = React.lazy(() => import('./screens/onboarding/OnboardingBirthDate'));
const OnboardingGender = React.lazy(() => import('./screens/onboarding/OnboardingGender'));
const OnboardingLookingForGender = React.lazy(() => import('./screens/onboarding/OnboardingLookingForGender'));
const OnboardingNiveau = React.lazy(() => import('./screens/onboarding/OnboardingNiveau'));
const OnboardingFrequency = React.lazy(() => import('./screens/onboarding/OnboardingFrequency'));
const OnboardingMaxDistance = React.lazy(() => import('./screens/onboarding/OnboardingMaxDistance'));
const OnboardingIntentions = React.lazy(() => import('./screens/onboarding/OnboardingIntentions'));
const OnboardingSports = React.lazy(() => import('./screens/onboarding/OnboardingSports'));
const OnboardingPhoto = React.lazy(() => import('./screens/onboarding/OnboardingPhoto'));
const OnboardingBio = React.lazy(() => import('./screens/onboarding/OnboardingBio'));
const OnboardingGeolocation = React.lazy(() => import('./screens/onboarding/OnboardingGeolocation'));
const OnboardingMotivationFinal = React.lazy(() => import('./screens/onboarding/OnboardingMotivationFinal'));
const SwipeIntro = React.lazy(() => import('./screens/app/SwipeIntro'));
const HomeSwipe = React.lazy(() => import('./screens/app/HomeSwipe'));
const MapsScreen = React.lazy(() => import('./screens/app/MapsScreen'));
const LikesScreen = React.lazy(() => import('./screens/app/LikesScreen'));
const ChatList = React.lazy(() => import('./screens/app/ChatList'));
const ChatConversation = React.lazy(() => import('./screens/app/ChatConversation'));
const MyProfile = React.lazy(() => import('./screens/app/MyProfile'));
const UserProfile = React.lazy(() => import('./screens/app/UserProfile'));
const SettingsScreen = React.lazy(() => import('./screens/app/SettingsScreen'));
const EditProfile = React.lazy(() => import('./screens/app/EditProfile'));
const PremiumScreen = React.lazy(() => import('./screens/app/PremiumScreen'));

function Protected({ children, requireOnboarding = false }) {
  return (
    <ProtectedRoute requireOnboarding={requireOnboarding}>
      {children}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }} />}>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/welcome-new-user" element={<WelcomeNewUser />} />

        <Route path="/onboarding" element={<OnboardingLayout />}>
          <Route path="welcome-rules" element={<OnboardingWelcomeRules />} />
          <Route path="first-name" element={<OnboardingFirstName />} />
          <Route path="welcome-personalized" element={<OnboardingWelcomePersonalized />} />
          <Route path="birth-date" element={<OnboardingBirthDate />} />
          <Route path="gender" element={<OnboardingGender />} />
          <Route path="looking-for-gender" element={<OnboardingLookingForGender />} />
          <Route path="sports" element={<OnboardingSports />} />
          <Route path="niveau" element={<OnboardingNiveau />} />
          <Route path="frequency" element={<OnboardingFrequency />} />
          <Route path="max-distance" element={<OnboardingMaxDistance />} />
          <Route path="intentions" element={<OnboardingIntentions />} />
          <Route path="photo" element={<OnboardingPhoto />} />
          <Route path="bio" element={<OnboardingBio />} />
          <Route path="geolocation" element={<OnboardingGeolocation />} />
          <Route path="motivation-final" element={<OnboardingMotivationFinal />} />
        </Route>

        <Route
          element={
            <Protected requireOnboarding>
              <AppShell />
            </Protected>
          }
        >
          <Route path="/home" element={<HomeSwipe />} />
          <Route path="/maps" element={<MapsScreen />} />
          <Route path="/likes" element={<LikesScreen />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/profile" element={<MyProfile />} />
        </Route>

        <Route
          path="/chat/:id"
          element={
            <Protected>
              <ChatConversation />
            </Protected>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <Protected>
              <EditProfile />
            </Protected>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <Protected>
              <UserProfile />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <SettingsScreen />
            </Protected>
          }
        />
        <Route
          path="/premium"
          element={
            <Protected>
              <PremiumScreen />
            </Protected>
          }
        />

        <Route
          path="/swipe-intro"
          element={
            <Protected requireOnboarding>
              <SwipeIntro />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
