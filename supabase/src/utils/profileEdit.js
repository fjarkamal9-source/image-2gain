import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getUserProfile } from './completeOnboarding';
import { setSettingsDistance } from './settingsStorage';
import { getOnboarding, getOnboardingJSON, setOnboarding, setOnboardingJSON } from './storage';

const PROFILE_SELECT =
  'prenom, bio, sports, intentions, niveau, frequence, max_distance, photo_url, ville';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function buildLocalEditableProfile() {
  const p = (await getUserProfile()) || {};
  return {
    prenom: getOnboarding('prenom') || p.prenom || '',
    ville: getOnboarding('ville') || p.ville || '',
    bio: getOnboarding('bio') || p.bio || '',
    sports: getOnboardingJSON('sports', [])?.length
      ? getOnboardingJSON('sports', [])
      : p.sports || [],
    intentions: getOnboardingJSON('intentions', [])?.length
      ? getOnboardingJSON('intentions', [])
      : p.intentions || [],
    niveau: getOnboarding('niveau') || p.niveau || '',
    frequence: getOnboarding('frequence') || p.frequence || '',
    max_distance: p.max_distance ?? 25,
    photo_url: getProfilePhotoUrl(),
  };
}

function applyProfileToLocal(profile) {
  if (profile.prenom != null) setOnboarding('prenom', profile.prenom);
  if (profile.ville != null) setOnboarding('ville', profile.ville);
  if (profile.bio != null) setOnboarding('bio', profile.bio);
  if (profile.niveau) setOnboarding('niveau', profile.niveau);
  if (profile.frequence) setOnboarding('frequence', profile.frequence);
  if (Array.isArray(profile.sports)) setOnboardingJSON('sports', profile.sports);
  if (Array.isArray(profile.intentions)) setOnboardingJSON('intentions', profile.intentions);
  if (profile.photo_url) {
    setOnboarding('photo_url', profile.photo_url);
    try {
      localStorage.setItem('profile_photo_url', profile.photo_url);
    } catch {
      /* ignore */
    }
  }
  syncUserProfile(profile);
  if (profile.max_distance != null) {
    setSettingsDistance(profile.max_distance);
  }
}

function readCachedProfilePhotoUrl() {
  try {
    const raw = localStorage.getItem('2gain_user_profile');
    if (raw) return JSON.parse(raw).photo_url || '';
  } catch {
    /* ignore */
  }
  return '';
}

export function getProfilePhotoUrl() {
  try {
    return (
      localStorage.getItem('profile_photo_url') ||
      getOnboarding('photo_url') ||
      readCachedProfilePhotoUrl() ||
      ''
    );
  } catch {
    return '';
  }
}

export function setProfilePhotoUrl(url) {
  try {
    if (url?.startsWith('data:')) {
      localStorage.setItem('profile_photo_url', url);
    } else if (url) {
      localStorage.setItem('profile_photo_url', url);
    } else {
      localStorage.removeItem('profile_photo_url');
    }
    setOnboarding('photo_url', url || '');
    syncUserProfile({ photo_url: url || '' });
  } catch {
    /* ignore */
  }
}

export function getProfileTags(profile) {
  const objectifs = getOnboardingJSON('intentions', null) ?? profile?.intentions ?? [];
  const sports = getOnboardingJSON('sports', null) ?? profile?.sports ?? [];
  const niveau = getOnboarding('niveau') || profile?.niveau || null;
  const frequence = getOnboarding('frequence') || profile?.frequence || null;
  return { objectifs, sports, niveau, frequence };
}

export function syncUserProfile(partial) {
  try {
    let current = {};
    const raw = localStorage.getItem('2gain_user_profile');
    if (raw) current = JSON.parse(raw);
    const merged = { ...current, ...partial };
    localStorage.setItem('2gain_user_profile', JSON.stringify(merged));
  } catch {
    /* ignore */
  }
}

/** Charge le profil éditable (Supabase → cache local, ou local seul). */
export async function fetchEditableProfile(userId) {
  const local = await buildLocalEditableProfile();

  if (!isSupabaseConfigured || !supabase || !userId) {
    return { profile: local, fromRemote: false };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return { profile: local, fromRemote: false };
    }

    const profile = {
      prenom: data.prenom ?? local.prenom,
      ville: data.ville ?? local.ville,
      bio: data.bio ?? local.bio,
      sports: Array.isArray(data.sports) ? data.sports : local.sports,
      intentions: Array.isArray(data.intentions) ? data.intentions : local.intentions,
      niveau: data.niveau ?? local.niveau,
      frequence: data.frequence ?? local.frequence,
      max_distance: data.max_distance ?? local.max_distance,
      photo_url: data.photo_url || local.photo_url,
    };

    applyProfileToLocal(profile);
    return { profile, fromRemote: true };
  } catch {
    return { profile: local, fromRemote: false };
  }
}

/** Upload vers le bucket `avatars` ; fallback data URL si Supabase absent. */
export async function uploadProfileAvatar(userId, file) {
  if (!file) return '';

  if (!isSupabaseConfigured || !supabase || !userId) {
    const dataUrl = await readFileAsDataUrl(file);
    setProfilePhotoUrl(dataUrl);
    return dataUrl;
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
    cacheControl: '3600',
  });

  if (uploadError) {
    console.error('avatar upload', uploadError);
    const dataUrl = await readFileAsDataUrl(file);
    setProfilePhotoUrl(dataUrl);
    return dataUrl;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = data.publicUrl;
  setProfilePhotoUrl(publicUrl);
  return publicUrl;
}

/** Upsert Supabase + cache local. */
export async function saveProfileEdit(userId, fields) {
  const {
    prenom,
    ville,
    bio,
    sports,
    intentions,
    niveau,
    frequence,
    max_distance,
    photo_url,
  } = fields;

  const localProfile = {
    prenom: prenom?.trim() ?? '',
    ville: ville?.trim() ?? '',
    bio: bio?.trim() ?? '',
    sports: sports ?? [],
    intentions: intentions ?? [],
    niveau: niveau || null,
    frequence: frequence || null,
    max_distance: Number(max_distance) || 25,
    photo_url: photo_url || getProfilePhotoUrl(),
  };

  applyProfileToLocal(localProfile);

  if (!isSupabaseConfigured || !supabase || !userId) {
    return { ok: true, local: true };
  }

  try {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        prenom: localProfile.prenom,
        ville: localProfile.ville,
        bio: localProfile.bio,
        sports: localProfile.sports,
        intentions: localProfile.intentions,
        niveau: localProfile.niveau,
        frequence: localProfile.frequence,
        max_distance: localProfile.max_distance,
        photo_url: localProfile.photo_url,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('profile edit upsert', error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    console.error('profile edit upsert', err);
    return { ok: false, error: err };
  }
}
