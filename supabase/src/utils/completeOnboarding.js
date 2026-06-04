import { getOnboarding, getOnboardingJSON, setOnboardingJSON } from './storage';
import { calcAge, parseBirthDate } from './age';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function flushOnboardingToProfile() {
  if (!isSupabaseConfigured || !supabase) return null;

  let session;
  try {
    const { data } = await supabase.auth.getSession();
    session = data?.session;
  } catch {
    return null;
  }
  if (!session?.user) return null;
  const user = session.user;
  const userPrenom = user.user_metadata?.full_name?.split(' ')?.[0] || 'Sportif';

  const profile = {
    id: user.id,
    email: getOnboarding('email') || user.email || '',
    prenom: getOnboarding('prenom') || userPrenom,
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
      // Upload photo base64 → Storage si nécessaire
      let photoUrl = profile.photo_url;
      if (photoUrl?.startsWith('data:')) {
        try {
          const res = await fetch(photoUrl);
          const blob = await res.blob();
          const path = `${profile.id}/onboarding.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
            photoUrl = urlData.publicUrl;
            // Mettre à jour le cache local avec l'URL publique
            try {
              localStorage.setItem('profile_photo_url', photoUrl);
              setOnboarding('photo_url', photoUrl);
            } catch { /* ignore */ }
          } else {
            console.error('onboarding photo upload', uploadError);
          }
        } catch (uploadErr) {
          console.error('onboarding photo fetch/upload', uploadErr);
        }
      }

      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        first_name: profile.prenom,
        city: profile.ville,
        distance_max: profile.max_distance,
        gender: profile.gender,
        looking_for: profile.looking_for,
        intentions: profile.intentions,
        sports: profile.sports,
        photo_url: photoUrl,
        bio: profile.bio,
        lat: profile.lat || null,
        lng: profile.lng || null,
        onboarding_completed: true,
        visible: true,
      });
      if (error) {
        console.error('flushOnboardingToProfile upsert', error);
        throw new Error(error.message || 'Échec de la sauvegarde du profil');
      }
    } catch (err) {
      if (err.message && err.message !== 'Échec de la sauvegarde du profil') {
        console.error('flushOnboardingToProfile', err);
      }
      throw err;
    }
  }

  return profile;
}

export async function getUserProfile() {
  try {
    const raw = localStorage.getItem('2gain_user_profile');
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  if (!isSupabaseConfigured || !supabase) return null;
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch {
    return null;
  }
  return user
    ? {
        id: user.id,
        prenom: user.user_metadata?.full_name?.split(' ')?.[0] || '',
        email: user.email,
        ville: '',
        max_distance: 25,
        age: null,
        intentions: [],
        sports: [],
        photo_url: '',
        bio: '',
      }
    : null;
}
