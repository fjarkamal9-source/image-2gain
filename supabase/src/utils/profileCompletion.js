import { getOnboarding, getOnboardingJSON } from './storage';
import { getProfilePhotoUrl } from './profileEdit';
export function computeProfileCompletion(profile) {
  const photo = getProfilePhotoUrl();
  const prenom = getOnboarding('prenom') || profile?.prenom;
  const bio = getOnboarding('bio') || profile?.bio;
  const sports = getOnboardingJSON('sports', [])?.length || profile?.sports?.length;
  const intentions =
    getOnboardingJSON('intentions', [])?.length || profile?.intentions?.length;
  const niveau = getOnboarding('niveau') || profile?.niveau;
  const ville = getOnboarding('ville') || profile?.ville;

  const fields = [photo, prenom, bio, sports, intentions, niveau, ville];
  const filled = fields.filter((v) => v && (typeof v === 'number' ? v > 0 : true)).length;
  return Math.min(100, filled * 14);
}
