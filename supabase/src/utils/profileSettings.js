import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { syncUserProfile } from './profileEdit';
import { getDiscoverySettings, setSettingsDistance } from './settingsStorage';
function readLocalProfile() {
  try {
    const raw = localStorage.getItem('2gain_user_profile');
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

function cacheLocally(patch) {
  const merged = { ...readLocalProfile(), ...patch };
  syncUserProfile(patch);

  if (patch.max_distance != null) {
    setSettingsDistance(patch.max_distance);
  }

  return merged;
}

export function getLocalProfileSettings() {
  const p = readLocalProfile();
  const discovery = getDiscoverySettings();
  return {
    distance: p.max_distance ?? discovery.distance ?? 25,
    looking_for: p.looking_for ?? '',
    niveau: p.niveau ?? '',
    frequence: p.frequence ?? '',
    visible: p.visible !== false,
  };
}

export async function fetchProfileSettings(userId) {
  const local = getLocalProfileSettings();

  if (!isSupabaseConfigured || !supabase || !userId) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('max_distance, looking_for, niveau, frequence, visible')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return local;
    }

    const settings = {
      distance: data.max_distance ?? local.distance,
      looking_for: data.looking_for ?? local.looking_for,
      niveau: data.niveau ?? local.niveau,
      frequence: data.frequence ?? local.frequence,
      visible: data.visible !== false,
    };

    cacheLocally({
      max_distance: settings.distance,
      looking_for: settings.looking_for,
      niveau: settings.niveau || null,
      frequence: settings.frequence || null,
      visible: settings.visible,
    });

    return settings;
  } catch {
    return local;
  }
}

/**
 * Sauvegarde immédiate (local + upsert Supabase).
 * `distance` est mappé sur la colonne `max_distance`.
 */
export async function saveProfileSettings(userId, patch) {
  const localPatch = {};

  if (patch.distance != null) {
    localPatch.max_distance = patch.distance;
  }
  if (patch.looking_for !== undefined) {
    localPatch.looking_for = patch.looking_for || '';
  }
  if (patch.niveau !== undefined) {
    localPatch.niveau = patch.niveau || null;
  }
  if (patch.frequence !== undefined) {
    localPatch.frequence = patch.frequence || null;
  }
  if (patch.visible !== undefined) {
    localPatch.visible = patch.visible;
  }

  if (Object.keys(localPatch).length) {
    cacheLocally(localPatch);
  }

  if (!isSupabaseConfigured || !supabase || !userId) {
    return { ok: true, local: true };
  }

  const dbPatch = { id: userId, ...localPatch };

  try {
    const { error } = await supabase.from('profiles').upsert(dbPatch, { onConflict: 'id' });
    if (error) {
      console.error('profile settings upsert', error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (err) {
    console.error('profile settings upsert', err);
    return { ok: false, error: err };
  }
}

export function isProfileVisibleInDiscovery(profileRow) {
  return profileRow?.visible !== false;
}
