const AVATAR_COLORS = ['#FF6B00', '#1A3FCC', '#9B59B6', '#E74C3C', '#2ECC71', '#3498DB'];

export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Fallback local quand Supabase n'est pas configuré. */
export const MOCK_PROFILES = [
  { id: 'p1', prenom: 'Sofia', age: 26, ville: 'Paris 10e', distance: 0.8, objectif: 'Rencontre amicale', sport: 'Running', niveau: 'Débutante', lat: 48.87, lng: 2.36, photo: '' },
  { id: 'p2', prenom: 'Lucas', age: 28, ville: 'Paris 11e', distance: 1.2, objectif: 'Prise de masse', sport: 'Musculation', niveau: 'Intermédiaire', lat: 48.86, lng: 2.38, photo: '' },
  { id: 'p3', prenom: 'Camila', age: 29, ville: 'Paris 18e', distance: 2.1, objectif: 'Partenaire sportif', sport: 'Yoga', niveau: 'Avancée', lat: 48.89, lng: 2.35, photo: '' },
  { id: 'p4', prenom: 'Rayan', age: 30, ville: 'Paris 19e', distance: 2.5, objectif: 'Partenaire sportif', sport: 'Football', niveau: 'Intermédiaire', lat: 48.88, lng: 2.39, photo: '' },
  { id: 'p5', prenom: 'Léa', age: 24, ville: 'Paris 9e', distance: 1.0, objectif: "Le plaisir d'une séance", sport: 'CrossFit', niveau: 'Débutante', lat: 48.87, lng: 2.34, photo: '' },
  { id: 'p6', prenom: 'Antoine', age: 27, ville: 'Paris 12e', distance: 3.2, objectif: 'Rencontre amicale', sport: 'Cyclisme', niveau: 'Intermédiaire', lat: 48.84, lng: 2.39, photo: '' },
  { id: 'p7', prenom: 'Inès', age: 28, ville: 'Paris 13e', distance: 2.8, objectif: 'Partenaire sportif', sport: 'Pilates', niveau: 'Avancée', lat: 48.83, lng: 2.36, photo: '' },
  { id: 'p8', prenom: 'Jordan', age: 26, ville: 'Paris 18e', distance: 2.0, objectif: 'Prise de masse', sport: 'CrossFit', niveau: 'Expert', lat: 48.89, lng: 2.35, photo: '' },
  { id: 'p9', prenom: 'Marie', age: 31, ville: 'Paris 20e', distance: 4.1, objectif: 'Partenaire sportif', sport: 'Natation', niveau: 'Intermédiaire', lat: 48.86, lng: 2.40, photo: '' },
  { id: 'p10', prenom: 'Thomas', age: 33, ville: 'Paris 14e', distance: 3.5, objectif: 'On verra si tu me suis', sport: 'Running', niveau: 'Avancée', lat: 48.83, lng: 2.33, photo: '' },
  { id: 'p11', prenom: 'Emma', age: 23, ville: 'Paris 15e', distance: 2.3, objectif: 'Romance sportive', sport: 'Danse', niveau: 'Débutante', lat: 48.84, lng: 2.30, photo: '' },
  { id: 'p12', prenom: 'Maxime', age: 31, ville: 'Montreuil', distance: 5.0, objectif: 'Partenaire sportif', sport: 'Escalade', niveau: 'Intermédiaire', lat: 48.86, lng: 2.44, photo: '' },
  { id: 'p13', prenom: 'Chloé', age: 27, ville: 'Vincennes', distance: 6.2, objectif: 'Rencontre amicale', sport: 'Randonnée', niveau: 'Débutante', lat: 48.85, lng: 2.44, photo: '' },
  { id: 'p14', prenom: 'Amine', age: 29, ville: 'Paris 10e', distance: 1.5, objectif: "Le plaisir d'une séance", sport: 'Tennis', niveau: 'Avancée', lat: 48.87, lng: 2.36, photo: '' },
  { id: 'p15', prenom: 'Juliette', age: 25, ville: 'Paris 11e', distance: 1.8, objectif: "Le plaisir d'une séance", sport: 'HIIT', niveau: 'Intermédiaire', lat: 48.86, lng: 2.38, photo: '' },
  { id: 'p16', prenom: 'Kevin', age: 24, ville: 'Paris 9e', distance: 1.1, objectif: 'Événements sportifs', sport: 'Basketball', niveau: 'Débutante', lat: 48.87, lng: 2.34, photo: '' },
  { id: 'p17', prenom: 'Sébastien', age: 35, ville: 'Bagnolet', distance: 7.0, objectif: 'Partenaire sportif', sport: 'Fitness', niveau: 'Expert', lat: 48.87, lng: 2.42, photo: '' },
  { id: 'p18', prenom: 'Mehdi', age: 32, ville: 'Paris 20e', distance: 4.0, objectif: 'Prise de masse', sport: 'Musculation', niveau: 'Avancée', lat: 48.86, lng: 2.40, photo: '' },
  { id: 'p19', prenom: 'Yuki', age: 25, ville: 'Paris 13e', distance: 2.6, objectif: 'Rencontre amicale', sport: 'Arts martiaux', niveau: 'Intermédiaire', lat: 48.83, lng: 2.36, photo: '' },
  { id: 'p20', prenom: 'Nicolas', age: 30, ville: 'Paris 15e', distance: 3.0, objectif: 'On verra si tu me suis', sport: 'Padel', niveau: 'Débutante', lat: 48.84, lng: 2.30, photo: '' },
];

/** @deprecated Utiliser MOCK_PROFILES */
export const mockProfiles = MOCK_PROFILES;

export function getProfilesNearUser(userProfile, maxKm = 25) {
  return MOCK_PROFILES.filter((p) => (p.distance ?? 99) <= (userProfile?.max_distance ?? maxKm));
}
