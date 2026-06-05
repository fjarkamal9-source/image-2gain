import { getOnboarding, getOnboardingJSON, setOnboardingJSON } from './storage';
import { calcAge, parseBirthDate } from './age';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

async function waitForSession(maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) return data.session;
    } catch { /* ignore */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

export async function flushOnboardingToProfile() {
  if (!isSupabaseConfigured || !supabase) return null;

  const session = await waitForSession();
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
  // Lire le cache local comme fallback uniquement
  let localProfile = null;
  try {
    const raw = localStorage.getItem('2gain_user_profile');
    if (raw) localProfile = JSON.parse(raw);
  } catch { /* ignore */ }

  // Sans Supabase → retourner le cache local
  if (!isSupabaseConfigured || !supabase) return localProfile;

  // Récupérer l'userId depuis la session (pas d'appel réseau)
  let userId = null;
  try {
    const { data } = await supabase.auth.getSession();
    userId = data?.session?.user?.id ?? null;
  } catch { /* ignore */ }

  if (!userId) return localProfile;

  // Fetch Supabase en priorité
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, photo_url, bio, city, sports, intentions, niveau, frequency, distance_max, looking_for, gender, lat, lng, visible, onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      // Mapper noms colonnes prod → noms locaux
      const profile = {
        id: data.id,
        prenom: data.first_name || '',
        email: localProfile?.email || '',
        photo_url: data.photo_url || '',
        bio: data.bio || '',
        ville: data.city || '',
        sports: data.sports || [],
        intentions: data.intentions || [],
        niveau: data.niveau || '',
        frequence: data.frequency || '',
        max_distance: data.distance_max ?? 25,
        looking_for: data.looking_for || '',
        gender: data.gender || '',
        lat: data.lat ?? localProfile?.lat ?? null,
        lng: data.lng ?? localProfile?.lng ?? null,
        visible: data.visible,
        onboarding_completed: data.onboarding_completed,
      };

      // Mettre à jour le cache local avec les données fraîches
      try {
        localStorage.setItem('2gain_user_profile', JSON.stringify(profile));
        if (profile.photo_url) localStorage.setItem('profile_photo_url', profile.photo_url);
      } catch { /* ignore */ }

      return profile;
    }
  } catch { /* ignore */ }

  // Fallback : cache local si Supabase échoue
  return localProfile;
}
