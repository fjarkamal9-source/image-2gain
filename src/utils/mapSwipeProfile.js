function haversineKm(lat1, lon1, lat2, lon2) {
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

/** Normalise une ligne `profiles` Supabase pour l’UI swipe. */
export function mapRowToSwipeProfile(row, userLat, userLng) {
  const intentions = Array.isArray(row.intentions) ? row.intentions : [];
  const sports = Array.isArray(row.sports) ? row.sports : [];

  let distance = 99;
  if (
    userLat != null &&
    userLng != null &&
    row.lat != null &&
    row.lng != null
  ) {
    distance = Math.round(haversineKm(userLat, userLng, row.lat, row.lng) * 10) / 10;
  }

  return {
    id: row.id,
    prenom: row.prenom || 'Sportif',
    age: row.age ?? 25,
    ville: row.ville || '',
    distance,
    objectif: intentions[0] || 'Partenaire sportif',
    sport: sports[0] || 'Sport',
    niveau: row.niveau || 'Intermédiaire',
    lat: row.lat,
    lng: row.lng,
    photo: row.photo_url || '',
  };
}
