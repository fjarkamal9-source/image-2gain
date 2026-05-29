import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import OnboardingLayout from './components/layout/OnboardingLayout';
import AuthScreen from './screens/AuthScreen';
import AuthCallback from './screens/AuthCallback';
import OnboardingEmail from './screens/onboarding/OnboardingEmail';
import OnboardingWelcomeRules from './screens/onboarding/OnboardingWelcomeRules';
import OnboardingFirstName from './screens/onboarding/OnboardingFirstName';
import OnboardingWelcomePersonalized from './screens/onboarding/OnboardingWelcomePersonalized';
import OnboardingBirthDate from './screens/onboarding/OnboardingBirthDate';
import OnboardingGender from './screens/onboarding/OnboardingGender';
import OnboardingLookingForGender from './screens/onboarding/OnboardingLookingForGender';
import OnboardingMaxDistance from './screens/onboarding/OnboardingMaxDistance';
import OnboardingIntentions from './screens/onboarding/OnboardingIntentions';
import OnboardingSports from './screens/onboarding/OnboardingSports';
import OnboardingPhoto from './screens/onboarding/OnboardingPhoto';
import OnboardingBio from './screens/onboarding/OnboardingBio';
import OnboardingGeolocation from './screens/onboarding/OnboardingGeolocation';
import OnboardingMotivationFinal from './screens/onboarding/OnboardingMotivationFinal';
import HomeSwipe from './screens/app/HomeSwipe';
import MapsScreen from './screens/app/MapsScreen';
import LikesScreen from './screens/app/LikesScreen';
import ChatList from './screens/app/ChatList';
import ChatConversation from './screens/app/ChatConversation';
import MyProfile from './screens/app/MyProfile';
import UserProfile from './screens/app/UserProfile';
import SettingsScreen from './screens/app/SettingsScreen';
import EditProfile from './screens/app/EditProfile';
import PremiumScreen from './screens/app/PremiumScreen';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/onboarding" element={<OnboardingLayout />}>
        <Route path="email" element={<OnboardingEmail />} />
        <Route path="welcome-rules" element={<OnboardingWelcomeRules />} />
        <Route path="first-name" element={<OnboardingFirstName />} />
        <Route path="welcome-personalized" element={<OnboardingWelcomePersonalized />} />
        <Route path="birth-date" element={<OnboardingBirthDate />} />
        <Route path="gender" element={<OnboardingGender />} />
        <Route path="looking-for-gender" element={<OnboardingLookingForGender />} />
        <Route path="max-distance" element={<OnboardingMaxDistance />} />
        <Route path="intentions" element={<OnboardingIntentions />} />
        <Route path="sports" element={<OnboardingSports />} />
        <Route path="photo" element={<OnboardingPhoto />} />
        <Route path="bio" element={<OnboardingBio />} />
        <Route path="geolocation" element={<OnboardingGeolocation />} />
      </Route>
      <Route path="/onboarding/motivation-final" element={<OnboardingMotivationFinal />} />

      <Route
        element={
          <Protected>
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
