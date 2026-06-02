import { isSupabaseConfigured, supabase } from '../lib/supabase';

function storageKey(matchId) {
  return `chat_messages_${matchId}`;
}

export function formatChatTime(isoOrMs) {
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday - startOfMsg) / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) {
    return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function mapDbMessage(row, currentUserId) {
  return {
    id: row.id,
    sender: row.sender_id === currentUserId ? 'me' : 'other',
    content: row.body,
    time: new Date(row.created_at).getTime(),
  };
}

export function loadChatMessages(matchId) {
  try {
    const raw = localStorage.getItem(storageKey(matchId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_THREAD.map((m) => ({ ...m }));
}

export function saveChatMessages(matchId, messages) {
  try {
    localStorage.setItem(storageKey(matchId), JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

export function pickAutoReply() {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}

/** Liste des conversations (match + dernier message + profil de l'autre). */
export async function fetchChatConversations(userId) {
  if (!userId || !isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('id, user_a, user_b, created_at')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (matchError) {
    console.error('fetchChatConversations matches', matchError);
    return MOCK_CONVERSATIONS;
  }

  if (!matches?.length) return [];

  const otherIds = matches.map((m) => (m.user_a === userId ? m.user_b : m.user_a));
  const matchIds = matches.map((m) => m.id);

  const [profilesRes, messagesRes] = await Promise.all([
    supabase.from('profiles').select('id, prenom, photo_url').in('id', otherIds),
    supabase
      .from('messages')
      .select('match_id, body, created_at, sender_id')
      .in('match_id', matchIds)
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  if (profilesRes.error) {
    console.error('fetchChatConversations profiles', profilesRes.error);
    return [];
  }
  if (messagesRes.error) {
    console.error('fetchChatConversations messages', messagesRes.error);
    return [];
  }

  const { data: profiles } = profilesRes;
  const { data: messages } = messagesRes;

  const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const lastByMatch = {};
  for (const msg of messages || []) {
    if (!lastByMatch[msg.match_id]) lastByMatch[msg.match_id] = msg;
  }

  return matches.map((m) => {
    const otherId = m.user_a === userId ? m.user_b : m.user_a;
    const profile = profileById[otherId];
    const last = lastByMatch[m.id];
    return {
      id: m.id,
      otherUserId: otherId,
      prenom: profile?.prenom ?? 'Sportif',
      photo: profile?.photo_url ?? '',
      last: last?.body ?? 'Nouveau match — dis bonjour !',
      time: formatChatTime(last?.created_at ?? m.created_at),
      unread: 0,
    };
  });
}

/** Infos match + profil de l'autre participant. */
export async function fetchMatchParticipant(matchId, userId) {
  if (!matchId || !userId) {
    return { prenom: 'Sportif', photo: '', otherUserId: null };
  }

  if (!isSupabaseConfigured || !supabase) {
    const mock = MOCK_PROFILES.find((p) => p.id === matchId.replace('mock-', ''));
    if (mock) {
      return { prenom: mock.prenom, photo: mock.photo || '', otherUserId: mock.id };
    }
    return { prenom: 'Sportif', photo: '', otherUserId: matchId };
  }

  const { data: match, error } = await supabase
    .from('matches')
    .select('id, user_a, user_b')
    .eq('id', matchId)
    .maybeSingle();

  if (error || !match) {
    console.error('fetchMatchParticipant', error);
    return { prenom: 'Sportif', photo: '', otherUserId: null };
  }

  const otherUserId = match.user_a === userId ? match.user_b : match.user_a;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, prenom, photo_url')
    .eq('id', otherUserId)
    .maybeSingle();

  return {
    prenom: profile?.prenom ?? 'Sportif',
    photo: profile?.photo_url ?? '',
    otherUserId,
  };
}

/** Messages d'un match (ordre chronologique). */
export async function fetchMessages(matchId, currentUserId) {
  if (!matchId) return [];

  if (!isSupabaseConfigured || !supabase) {
    return loadChatMessages(matchId);
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, body, sender_id, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchMessages', error);
    return loadChatMessages(matchId);
  }

  return (data || []).map((row) => mapDbMessage(row, currentUserId));
}

/** Envoie un message (Supabase ou localStorage). */
export async function sendChatMessage(matchId, senderId, body) {
  const trimmed = body.trim();
  if (!trimmed) return null;

  if (!isSupabaseConfigured || !supabase || !senderId) {
    const msg = {
      id: Date.now(),
      sender: 'me',
      content: trimmed,
      time: Date.now(),
    };
    const existing = loadChatMessages(matchId);
    saveChatMessages(matchId, [...existing, msg]);
    return msg;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      body: trimmed,
    })
    .select('id, body, sender_id, created_at')
    .single();

  if (error) {
    console.error('sendChatMessage', error);
    return null;
  }

  return mapDbMessage(data, senderId);
}

/** Realtime : nouveaux messages sur un match. */
export function subscribeToMatchMessages(matchId, currentUserId, onInsert) {
  if (!isSupabaseConfigured || !supabase || !matchId) {
    return () => {};
  }

  const channel = supabase
    .channel(`messages-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const row = payload.new;
        if (!row?.id) return;
        onInsert(mapDbMessage(row, currentUserId));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
