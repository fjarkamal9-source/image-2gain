import { getOnboarding, getOnboardingJSON } from './storage';
import { getDiscoverySettings } from './settingsStorage';

const WEIGHTS = {
  sports: 0.4,
  frequence: 0.3,
  distance: 0.2,
  niveau: 0.1,
};

const FREQUENCE_ORDER = ['1', '2-3', '4-5', '6+', 'variable'];

const NIVEAU_ORDER = ['débutant', 'debutant', 'intermédiaire', 'intermediaire', 'avancé', 'avance', 'expert'];

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function matchesNiveau(profileNiveau, settingsNiveau) {
  if (!settingsNiveau) return true;
  const p = (profileNiveau || '').toLowerCase();
  const s = settingsNiveau.toLowerCase();
  if (s.startsWith('début') || s.startsWith('debut')) {
    return p.startsWith('début') || p.startsWith('debut');
  }
  if (s.startsWith('inter')) {
    return p.startsWith('inter');
  }
  if (s.startsWith('avan')) {
    return p.startsWith('avan') || p === 'expert';
  }
  return profileNiveau === settingsNiveau;
}

function getProfileSports(profile) {
  if (Array.isArray(profile.sports) && profile.sports.length) return profile.sports;
  if (profile.sport) return [profile.sport];
  return [];
}

function normalizeNiveauKey(niveau) {
  return (niveau || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

function niveauIndex(niveau) {
  const n = normalizeNiveauKey(niveau);
  if (!n) return -1;
  if (n.startsWith('debut')) return 0;
  if (n.startsWith('inter')) return 1;
  if (n.startsWith('avan')) return 2;
  if (n === 'expert') return 3;
  const idx = NIVEAU_ORDER.findIndex((k) => n.includes(k.replace('é', 'e').slice(0, 4)));
  return idx >= 0 ? Math.min(idx, 3) : -1;
}

function frequenceIndex(freq) {
  if (!freq) return -1;
  const normalized = String(freq).toLowerCase().trim();
  const directIdx = FREQUENCE_ORDER.indexOf(normalized);
  if (directIdx >= 0) return directIdx;
  if (normalized === 'variable') return 2;
  if (normalized.includes('6') || normalized.includes('7') || normalized.includes('8')) return 3;
  const match = normalized.match(/(\d+)/);
  if (match) {
    const n = Number(match[1]);
    if (n <= 1) return 0;
    if (n <= 3) return 1;
    if (n <= 5) return 2;
    return 3;
  }
  return -1;
}

/** Sports communs — 0 à 1 (Jaccard). */
export function scoreSportsCommon(viewerSports, profileSports) {
  const a = viewerSports.map((s) => s.toLowerCase());
  const b = profileSports.map((s) => s.toLowerCase());
  if (!a.length || !b.length) return 0.5;
  const intersection = a.filter((s) => b.includes(s)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

/** Disponibilité / fréquence — 0 à 1 (proximité). */
export function scoreFrequence(viewerFreq, profileFreq) {
  const vi = frequenceIndex(viewerFreq);
  const pi = frequenceIndex(profileFreq);
  if (vi < 0 || pi < 0) return 0.5;
  const maxDiff = FREQUENCE_ORDER.length - 1;
  return 1 - Math.min(Math.abs(vi - pi) / maxDiff, 1);
}

/** Distance — 0 à 1 (plus proche = mieux). */
export function scoreDistanceKm(distanceKm, maxKm) {
  if (maxKm <= 0) return 1;
  if (distanceKm == null || Number.isNaN(distanceKm)) return 0.5;
  return 1 - Math.min(distanceKm / maxKm, 1);
}

/** Niveau — 0 à 1 (alignement). */
export function scoreNiveau(viewerNiveau, profileNiveau) {
  const vi = niveauIndex(viewerNiveau);
  const pi = niveauIndex(profileNiveau);
  if (vi < 0 || pi < 0) return 0.5;
  const maxDiff = 3;
  return 1 - Math.min(Math.abs(vi - pi) / maxDiff, 1);
}

function resolveDistanceKm(profile, viewer) {
  if (
    viewer?.lat != null &&
    viewer?.lng != null &&
    profile.lat != null &&
    profile.lng != null
  ) {
    return haversineKm(viewer.lat, viewer.lng, profile.lat, profile.lng);
  }
  const d = Number(profile.distance);
  return Number.isNaN(d) ? null : d;
}

export function getViewerDiscoveryContext(viewer) {
  if (viewer) {
    return {
      sports: getProfileSports(viewer),
      frequency: viewer.frequency ?? null,
      niveau: viewer.niveau ?? null,
      lat: viewer.lat,
      lng: viewer.lng,
      max_distance: viewer.max_distance ?? 25,
    };
  }

  let p = {};
  try {
    const raw = localStorage.getItem('2gain_user_profile');
    if (raw) p = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const sports = getOnboardingJSON('sports', []);
  return {
    sports: sports.length ? sports : getProfileSports(p),
    frequency: getOnboarding('frequency') || p.frequency || null,
    niveau: getOnboarding('niveau') || p.niveau || null,
    lat: p.lat,
    lng: p.lng,
    max_distance: p.max_distance ?? 25,
  };
}

/** Score pondéré 0–100. */
export function computeDiscoveryScore(profile, viewer, settings) {
  if (!settings) settings = getDiscoverySettings();
  const ctx = getViewerDiscoveryContext(viewer);
  const maxKm = Math.min(settings.distance, ctx.max_distance ?? settings.distance);
  const profileSports = getProfileSports(profile);
  const distanceKm = resolveDistanceKm(profile, ctx);

  const sports = scoreSportsCommon(ctx.sports, profileSports);
  const frequence = scoreFrequence(ctx.frequency, profile.frequency ?? profile.frequence);
  const distance = scoreDistanceKm(distanceKm, maxKm);
  const niveau = scoreNiveau(ctx.niveau, profile.niveau);

  const total =
    sports * WEIGHTS.sports +
    frequence * WEIGHTS.frequence +
    distance * WEIGHTS.distance +
    niveau * WEIGHTS.niveau;

  return Math.round(total * 100);
}

export function filterDiscoveryProfiles(
  profiles = [],
  settings = getDiscoverySettings(),
  excludedIds = new Set(),
  viewer = null
) {
  const ctx = getViewerDiscoveryContext(viewer);

  // Distance, genre, sports, niveau filtrés côté serveur (RPC SQL).
  // Côté client : exclusion des profils déjà likés/passés/cachés + scoring.
  const filtered = profiles.filter((p) => {
    if (excludedIds.has(p.id)) return false;
    if (p.age != null && (p.age < settings.ageMin || p.age > settings.ageMax)) return false;
    return true;
  });

  return filtered
    .map((p) => ({
      profile: p,
      score: computeDiscoveryScore(p, ctx, settings),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ profile }) => profile);
}
