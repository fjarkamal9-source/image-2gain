import { getOnboarding, getOnboardingJSON, setOnboarding, setOnboardingJSON } from './storage';
import { getUserProfile } from './completeOnboarding';

export function getProfilePhotoUrl() {
  try {
    return (
      localStorage.getItem('profile_photo_url') ||
      getOnboarding('photo_url') ||
      getUserProfile()?.photo_url ||
      ''
    );
  } catch {
    return '';
  }
}

export function setProfilePhotoUrl(dataUrl) {
  try {
    localStorage.setItem('profile_photo_url', dataUrl);
    setOnboarding('photo_url', dataUrl);
    syncUserProfile({ photo_url: dataUrl });
  } catch {
    /* ignore */
  }
}

export function getProfileTags() {
  const profile = getUserProfile();
  const objectifs = getOnboardingJSON('intentions', null) ?? profile?.intentions ?? [];
  const sports = getOnboardingJSON('sports', null) ?? profile?.sports ?? [];
  const niveau = getOnboarding('niveau') || profile?.niveau || null;
  const frequence = getOnboarding('frequence') || profile?.frequence || null;
  return { objectifs, sports, niveau, frequence };
}

export function syncUserProfile(partial) {
  try {
    const current = getUserProfile() || {};
    const merged = { ...current, ...partial };
    localStorage.setItem('2gain_user_profile', JSON.stringify(merged));
  } catch {
    /* ignore */
  }
}

export function saveProfileEdit({ prenom, ville, bio, sports, intentions, niveau, frequence }) {
  setOnboarding('prenom', prenom);
  setOnboarding('ville', ville);
  setOnboarding('bio', bio);
  setOnboardingJSON('sports', sports);
  setOnboardingJSON('intentions', intentions);
  if (niveau) setOnboarding('niveau', niveau);
  if (frequence) setOnboarding('frequence', frequence);
  syncUserProfile({
    prenom,
    ville,
    bio,
    sports,
    intentions,
    niveau,
    frequence,
    photo_url: getProfilePhotoUrl(),
  });
}
