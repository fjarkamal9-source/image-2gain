const VENUES_LIKED = 'venues_liked';
const LEGACY_KEY = '2gain_venues_liked';

function readList() {
  try {
    const raw = localStorage.getItem(VENUES_LIKED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

function migrateLegacy(venuesById) {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw || readList().length) return;
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids) || !venuesById) return;
    const migrated = ids
      .map((id) => venuesById.find((v) => v.id === id))
      .filter(Boolean)
      .map((v) => ({ venue_name: v.name, venue_id: v.id, city: v.city }));
    if (migrated.length) {
      localStorage.setItem(VENUES_LIKED, JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function getVenuesLiked(migrateFrom = []) {
  migrateLegacy(migrateFrom);
  return readList();
}

export function isVenueLiked(venueName, list = readList()) {
  return list.some((v) => v.venue_name === venueName);
}

export function addVenueLiked(venue) {
  const list = readList();
  if (isVenueLiked(venue.name, list)) return list;
  list.push({
    venue_name: venue.name,
    venue_id: venue.id,
    city: venue.city,
  });
  try {
    localStorage.setItem(VENUES_LIKED, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}
