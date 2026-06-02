const PREFIX = 'onboarding_';

export function getOnboarding(key, fallback = '') {
  try {
    return localStorage.getItem(`${PREFIX}${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setOnboarding(key, value) {
  try {
    if (value === null || value === undefined || value === '') {
      localStorage.removeItem(`${PREFIX}${key}`);
    } else {
      localStorage.setItem(`${PREFIX}${key}`, String(value));
    }
  } catch {
    /* ignore */
  }
}

export function getOnboardingJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setOnboardingJSON(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(`${PREFIX}${key}`);
    } else {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    }
  } catch {
    /* ignore */
  }
}

export function clearOnboarding() {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

