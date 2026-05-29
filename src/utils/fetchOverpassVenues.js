import { venues as STATIC_VENUES, VENUE_TYPES } from '../data/venues';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const DEFAULT_RADIUS_M = 10000;
const MAX_VENUES = 120;

function buildQuery(lat, lng, radiusM) {
  const r = Math.round(radiusM);
  const around = `(around:${r},${lat},${lng})`;
  return `
[out:json][timeout:25];
(
  node${around}["leisure"~"^(fitness_centre|sports_centre|swimming_pool|pitch|track|stadium)$"];
  way${around}["leisure"~"^(fitness_centre|sports_centre|swimming_pool|pitch|track|stadium)$"];
  node${around}["amenity"~"^(gym|swimming_pool)$"];
  way${around}["amenity"~"^(gym|swimming_pool)$"];
  node${around}["sport"~"^(basketball|soccer|football|tennis|multi)$"];
  way${around}["sport"~"^(basketball|soccer|football|tennis|multi)$"];
  node${around}["leisure"="climbing"];
  way${around}["leisure"="climbing"];
);
out center qt;
`.trim();
}

function classifyVenueType(tags) {
  const leisure = tags.leisure || '';
  const sport = (tags.sport || '').toLowerCase();
  const amenity = tags.amenity || '';

  if (
    leisure === 'swimming_pool' ||
    amenity === 'swimming_pool' ||
    tags.building === 'swimming_hall'
  ) {
    return 'piscine';
  }

  if (leisure === 'track' || sport === 'running' || sport === 'athletics') {
    return 'running';
  }

  if (
    leisure === 'climbing' ||
    sport === 'climbing' ||
    sport === 'bouldering'
  ) {
    return 'event';
  }

  if (
    leisure === 'pitch' ||
    leisure === 'stadium' ||
    ['basketball', 'soccer', 'football', 'tennis', 'multi', 'volleyball'].includes(sport)
  ) {
    return 'terrain';
  }

  if (
    leisure === 'fitness_centre' ||
    leisure === 'sports_centre' ||
    amenity === 'gym'
  ) {
    return 'salle';
  }

  return 'terrain';
}

function venueName(tags) {
  return (
    tags.name ||
    tags['name:fr'] ||
    tags.operator ||
    tags.brand ||
    null
  );
}

function defaultName(type, sport) {
  const labels = {
    salle: 'Salle de sport',
    terrain: sport ? `Terrain ${sport}` : 'Terrain sportif',
    piscine: 'Piscine',
    running: 'Piste / running',
    event: 'Site sportif',
  };
  return labels[type] || 'Lieu sportif';
}

function mapElement(element, fallbackCity) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null) return null;

  const type = classifyVenueType(tags);
  const sport = tags.sport || '';
  const name = venueName(tags) || defaultName(type, sport);

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    type,
    city: tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || fallbackCity || '',
    lat: Number(lat),
    lng: Number(lng),
  };
}

function dedupeVenues(list) {
  const seen = new Set();
  return list.filter((v) => {
    const key = `${v.name.toLowerCase()}|${v.lat.toFixed(4)}|${v.lng.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * @param {number} lat
 * @param {number} lng
 * @param {{ radiusM?: number, city?: string }} [options]
 */
export async function fetchOverpassVenues(lat, lng, options = {}) {
  const { radiusM = DEFAULT_RADIUS_M, city = '' } = options;

  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { ok: false, venues: STATIC_VENUES, source: 'static' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const query = buildQuery(lat, lng, radiusM);
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Overpass HTTP ${res.status}`);
    }

    const json = await res.json();
    const elements = json.elements || [];

    const mapped = dedupeVenues(
      elements
        .map((el) => mapElement(el, city))
        .filter(Boolean)
    ).slice(0, MAX_VENUES);

    if (!mapped.length) {
      return { ok: false, venues: STATIC_VENUES, source: 'static' };
    }

    return { ok: true, venues: mapped, source: 'overpass' };
  } catch (err) {
    console.error('fetchOverpassVenues', err);
    return { ok: false, venues: STATIC_VENUES, source: 'static' };
  } finally {
    clearTimeout(timeoutId);
  }
}

export { VENUE_TYPES };
