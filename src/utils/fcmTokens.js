import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * Enregistre ou met à jour un token FCM pour l'utilisateur (upsert sur user_id + token).
 */
export async function saveFcmToken(userId, token) {
  if (!userId || !token?.trim()) {
    return { ok: false, error: new Error('userId et token requis') };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, skipped: true };
  }

  try {
    const { error } = await supabase.from('fcm_tokens').upsert(
      {
        user_id: userId,
        token: token.trim(),
      },
      { onConflict: 'user_id,token' }
    );

    if (error) {
      console.error('saveFcmToken', error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    console.error('saveFcmToken', err);
    return { ok: false, error: err };
  }
}

/**
 * Supprime tous les tokens FCM de l'utilisateur (ex. déconnexion).
 */
export async function deleteFcmToken(userId) {
  if (!userId) {
    return { ok: false, error: new Error('userId requis') };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, skipped: true };
  }

  try {
    const { error } = await supabase.from('fcm_tokens').delete().eq('user_id', userId);

    if (error) {
      console.error('deleteFcmToken', error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    console.error('deleteFcmToken', err);
    return { ok: false, error: err };
  }
}
