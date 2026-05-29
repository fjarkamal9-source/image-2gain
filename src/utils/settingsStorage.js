const KEYS = {
  distance: 'settings_distance',
  ageMin: 'settings_age_min',
  ageMax: 'settings_age_max',
  niveau: 'settings_niveau',
};

function readNumber(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === '') return fallback;
    const n = Number(raw);
    return Number.isNaN(n) ? fallback : n;
  } catch {
    return fallback;
  }
}

function readString(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined || value === '') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch {
    /* ignore */
  }
}

export function getDiscoverySettings() {
  return {
    distance: readNumber(KEYS.distance, 25),
    ageMin: readNumber(KEYS.ageMin, 18),
    ageMax: readNumber(KEYS.ageMax, 35),
    niveau: readString(KEYS.niveau, '') || null,
  };
}

export function setSettingsDistance(km) {
  write(KEYS.distance, km);
}

export function setSettingsAgeMin(age) {
  write(KEYS.ageMin, age);
}

export function setSettingsAgeMax(age) {
  write(KEYS.ageMax, age);
}

export function setSettingsNiveau(niveau) {
  write(KEYS.niveau, niveau);
}

export function saveDiscoverySettings({ distance, ageMin, ageMax, niveau }) {
  setSettingsDistance(distance);
  setSettingsAgeMin(ageMin);
  setSettingsAgeMax(ageMax);
  if (niveau) setSettingsNiveau(niveau);
  else localStorage.removeItem(KEYS.niveau);
}
