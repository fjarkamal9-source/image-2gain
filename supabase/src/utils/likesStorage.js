import { isSupabaseConfigured, supabase } from '../lib/supabase';

const LIKES_SENT = 'likes_envoyes';
const LIKES_LAST_SEEN = 'likes_last_seen_at';
const LIKES_RECEIVED = 'likes_recus';
const MATCHES = '2gain_matches';

const LEGACY_SENT = '2gain_likes_sent';
const LEGACY_RECEIVED = '2gain_likes_received';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function migrateLegacy() {
  const legacySent = read(LEGACY_SENT);
  const legacyReceived = read(LEGACY_RECEIVED);
  if (legacySent.length && !read(LIKES_SENT).length) {
    write(LIKES_SENT, legacySent);
    localStorage.removeItem(LEGACY_SENT);
  }
  if (legacyReceived.length && !read(LIKES_RECEIVED).length) {
    write(LIKES_RECEIVED, legacyReceived);
    localStorage.removeItem(LEGACY_RECEIVED);
  }
}

export function getLikesSent() {
  migrateLegacy();
  return read(LIKES_SENT);
}

export function getLikesReceived() {
  migrateLegacy();
  return read(LIKES_RECEIVED);
}

export function getMatches() {
  return read(MATCHES);
}

export function addLikeSent(profileId) {
  const list = getLikesSent();
  if (!list.includes(profileId)) {
    list.push(profileId);
    write(LIKES_SENT, list);
  }
}

function normalizeIds(list) {
  return list
    .map((item) => (typeof item === 'string' ? item : item?.id))
    .filter(Boolean);
}

export function getLikesReceivedIds() {
  return normalizeIds(getLikesReceived());
}

export function addMatch(profileId) {
  const list = getMatches();
  if (!list.includes(profileId)) {
    list.push(profileId);
    write(MATCHES, list);
  }
}

/** Insert un like (sender → receiver) dans Supabase. */
export async function pushLikeToSupabase(senderId, receiverId) {
  if (!isSupabaseConfigured || !supabase || !senderId || !receiverId) {
    return { ok: false, skipped: true };
  }

  const { error } = await supabase.from('likes').insert({
    sender_id: senderId,
    receiver_id: receiverId,
  });

  if (error) {
    if (error.code === '23505') return { ok: true, duplicate: true };
    console.error('pushLikeToSupabase', error);
    return { ok: false, error };
  }

  return { ok: true };
}

/**
 * Si l'autre utilisateur m'a déjà liké, crée un match.
 * @returns {{ matched: boolean, matchId?: string }}
 */
export async function checkAndCreateMatch(senderId, receiverId) {
  if (!isSupabaseConfigured || !supabase || !senderId || !receiverId) {
    return { matched: false };
  }

  const { data: reciprocal, error: selectError } = await supabase
    .from('likes')
    .select('id')
    .eq('sender_id', receiverId)
    .eq('receiver_id', senderId)
    .maybeSingle();

  if (selectError) {
    console.error('checkAndCreateMatch select', selectError);
    return { matched: false, error: selectError };
  }

  if (!reciprocal) return { matched: false };

  const [user_a, user_b] =
    senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];

  const { data: match, error: insertError } = await supabase
    .from('matches')
    .insert({ user_a, user_b })
    .select('id')
    .maybeSingle();

  if (insertError) {
    if (insertError.code === '23505') {
      // Match déjà existant — récupérer son id
      const { data: existing } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user_a.eq.${senderId},user_b.eq.${receiverId}),and(user_a.eq.${receiverId},user_b.eq.${senderId})`)
        .single();
      return { matched: true, matchId: existing?.id };
    }
    console.error('checkAndCreateMatch insert', insertError);
    return { matched: true };
  }

  return { matched: true, matchId: match?.id };
}

/** Pass temporaire (+7 jours) dans Supabase. */
export async function pushPassToSupabase(passerId, passedId) {
  if (!isSupabaseConfigured || !supabase || !passerId || !passedId) {
    return { ok: false, skipped: true };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await supabase.from('passes').insert({
    passer_id: passerId,
    passed_id: passedId,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    if (error.code === '23505') return { ok: true, duplicate: true };
    console.error('pushPassToSupabase', error);
    return { ok: false, error };
  }

  return { ok: true };
}

/** Masquage définitif dans Supabase. */
export async function pushHideToSupabase(hiderId, hiddenId, reason = 'swipe') {
  if (!isSupabaseConfigured || !supabase || !hiderId || !hiddenId) {
    return { ok: false, skipped: true };
  }

  const { error } = await supabase.from('hides').insert({
    hider_id: hiderId,
    hidden_id: hiddenId,
    reason,
  });

  if (error) {
    if (error.code === '23505') return { ok: true, duplicate: true };
    console.error('pushHideToSupabase', error);
    return { ok: false, error };
  }

  return { ok: true };
}

/** IDs à exclure du deck (likes envoyés, passes actifs, hides). */
export async function fetchExcludedProfileIds(userId) {
  const excluded = new Set(getLikesSent());

  if (!isSupabaseConfigured || !supabase || !userId) {
    return excluded;
  }

  const now = new Date().toISOString();

  const [likesRes, passesRes, hidesRes] = await Promise.all([
    supabase.from('likes').select('receiver_id').eq('sender_id', userId).limit(500),
    supabase
      .from('passes')
      .select('passed_id')
      .eq('passer_id', userId)
      .gt('expires_at', now)
      .limit(500),
    supabase.from('hides').select('hidden_id').eq('hider_id', userId).limit(500),
  ]);

  likesRes.data?.forEach((row) => excluded.add(row.receiver_id));
  passesRes.data?.forEach((row) => excluded.add(row.passed_id));
  hidesRes.data?.forEach((row) => excluded.add(row.hidden_id));

  return excluded;
}

export function isLikeSent(profileId) {
  return getLikesSent().includes(profileId);
}

export function getLikesLastSeenAt() {
  try {
    return localStorage.getItem(LIKES_LAST_SEEN) || null;
  } catch {
    return null;
  }
}

export function markLikesAsSeen() {
  try {
    localStorage.setItem(LIKES_LAST_SEEN, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

function mapProfileFromJoin(row, profileKey = 'profiles') {
  const profile = row[profileKey] ?? row.sender ?? row.receiver;
  const profileId = profile?.id ?? row.sender_id ?? row.receiver_id;
  return {
    likeId: row.id,
    id: profileId,
    prenom: profile?.first_name ?? 'Sportif',
    photo: profile?.photo_url ?? '',
    created_at: row.created_at ?? null,
  };
}

/** Likes reçus (receiver_id = moi) + profil expéditeur. */
export async function fetchLikesReceived(userId) {
  if (!userId) return [];

  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('likes')
    .select(
      `
      id,
      created_at,
      sender_id,
      profiles!likes_sender_id_fkey (
        id,
        first_name,
        photo_url
      )
    `
    )
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchLikesReceived', error);
    return [];
  }

  return (data || []).map((row) => mapProfileFromJoin(row));
}

/** Likes envoyés (sender_id = moi) + profil destinataire. */
export async function fetchLikesSent(userId) {
  if (!userId) return [];

  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('likes')
    .select(
      `
      id,
      created_at,
      receiver_id,
      profiles!likes_receiver_id_fkey (
        id,
        first_name,
        photo_url
      )
    `
    )
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchLikesSent', error);
    return [];
  }

  return (data || []).map((row) => mapProfileFromJoin(row));
}

/** Nombre de likes reçus non vus (depuis dernière visite onglet Likes). */
export async function fetchUnseenLikesCount(userId) {
  if (!userId) return 0;

  const lastSeen = getLikesLastSeenAt();

  if (!isSupabaseConfigured || !supabase) {
    const received = await fetchLikesReceived(userId);
    if (!lastSeen) return received.length;
    return received.filter((l) => l.created_at && l.created_at > lastSeen).length;
  }

  let query = supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId);

  if (lastSeen) {
    query = query.gt('created_at', lastSeen);
  }

  const { count, error } = await query;

  if (error) {
    console.error('fetchUnseenLikesCount', error);
    return 0;
  }

  return count ?? 0;
}
