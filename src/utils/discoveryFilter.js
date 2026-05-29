import { MOCK_PROFILES } from '../data/mockProfiles';
import { getDiscoverySettings } from './settingsStorage';

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

export function filterDiscoveryProfiles(
  profiles = MOCK_PROFILES,
  settings = getDiscoverySettings(),
  excludedIds = new Set()
) {
  return profiles.filter((p) => {
    if (excludedIds.has(p.id)) return false;
    const dist = Number(p.distance);
    if (!Number.isNaN(dist) && dist > settings.distance) return false;
    if (p.age < settings.ageMin || p.age > settings.ageMax) return false;
    if (!matchesNiveau(p.niveau, settings.niveau)) return false;
    return true;
  });
}
