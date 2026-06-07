/** Normalise une ligne retournée par get_profiles_with_distance() pour l'UI swipe. */
export function mapRowToSwipeProfile(row) {
  const intentions = Array.isArray(row.intentions) ? row.intentions : [];
  const sports = Array.isArray(row.sports) ? row.sports : [];

  return {
    id: row.id,
    prenom: row.first_name || 'Sportif',
    ville: row.city || '',
    distance: row.distance_km ?? 99,
    sports,
    frequency: row.frequency || null,
    niveau: row.niveau || null,
    photo: row.photo_url || '',
    // lat/lng supprimés — jamais transmis au client
  };
}
