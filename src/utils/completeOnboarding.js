import { getOnboarding, getOnboardingJSON, getSession, setOnboardingJSON } from './storage';
import { calcAge, parseBirthDate } from './age';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function flushOnboardingToProfile() {
  const session = getSession();
  if (!session) return;

  const profile = {
    id: session.id,
    email: getOnboarding('email') || session.email || '',
    prenom: getOnboarding('prenom') || session.prenom || 'Sportif',
    birth_day: getOnboarding('birth_day'),
    birth_month: getOnboarding('birth_month'),
    birth_year: getOnboarding('birth_year'),
    gender: getOnboarding('gender'),
    looking_for: getOnboarding('looking_for'),
    max_distance: Number(getOnboarding('max_distance') || 25),
    intentions: getOnboardingJSON('intentions', []),
    sports: getOnboardingJSON('sports', []),
    photo_url: getOnboarding('photo_url') || '',
    bio: getOnboarding('bio') || '',
    ville: getOnboarding('ville') || 'Besançon',
    lat: Number(getOnboarding('lat') || 47.2378),
    lng: Number(getOnboarding('lng') || 6.0241),
  };

  if (profile.birth_day && profile.birth_month && profile.birth_year) {
    const bd = parseBirthDate(profile.birth_day, profile.birth_month, profile.birth_year);
    profile.age = calcAge(bd);
  }

  try {
    localStorage.setItem('2gain_user_profile', JSON.stringify(profile));
    if (profile.photo_url) {
      localStorage.setItem('profile_photo_url', profile.photo_url);
    }
    setOnboardingJSON('intentions', profile.intentions);
    setOnboardingJSON('sports', profile.sports);
  } catch {
    /* ignore */
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        email: profile.email,
        prenom: profile.prenom,
        age: profile.age,
        gender: profile.gender,
        looking_for: profile.looking_for,
        max_distance: profile.max_distance,
        intentions: profile.intentions,
        sports: profile.sports,
        photo_url: profile.photo_url,
        bio: profile.bio,
        ville: profile.ville,
        lat: profile.lat,
        lng: profile.lng,
        onboarding_completed: true,
      });
    } catch {
      /* mock mode fallback */
    }
  }

  return profile;
}

export function getUserProfile() {
  try {
    const raw = localStorage.getItem('2gain_user_profile');
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const session = getSession();
  return session
    ? {
        id: session.id,
        prenom: session.prenom || 'K',
        email: session.email,
        ville: 'Paris',
        max_distance: 25,
        age: 28,
        intentions: [],
        sports: [],
        photo_url: '',
        bio: '',
      }
    : null;
}
