import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  fetchUnseenLikesCount,
  markLikesAsSeen,
} from '../utils/likesStorage';
import { useAuth } from '../hooks/useAuth';

const LikesBadgeContext = createContext(null);

export function LikesBadgeProvider({ children }) {
  const { user } = useAuth();
  const [unseenCount, setUnseenCount] = useState(0);
  const uid = user?.id ?? null;

  const refreshUnseenCount = useCallback(async () => {
    if (!uid) {
      setUnseenCount(0);
      return;
    }
    const count = await fetchUnseenLikesCount(uid);
    setUnseenCount(count);
  }, [uid]);

  const markSeen = useCallback(() => {
    markLikesAsSeen();
    setUnseenCount(0);
  }, []);

  useEffect(() => {
    refreshUnseenCount();
  }, [refreshUnseenCount]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !uid) return undefined;

    const channel = supabase
      .channel(`likes-received-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `receiver_id=eq.${uid}`,
        },
        () => {
          refreshUnseenCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, refreshUnseenCount]);

  const value = useMemo(
    () => ({
      unseenCount,
      refreshUnseenCount,
      markSeen,
    }),
    [unseenCount, refreshUnseenCount, markSeen]
  );

  return (
    <LikesBadgeContext.Provider value={value}>{children}</LikesBadgeContext.Provider>
  );
}

export function useLikesBadge() {
  const ctx = useContext(LikesBadgeContext);
  if (!ctx) {
    throw new Error('useLikesBadge must be used within LikesBadgeProvider');
  }
  return ctx;
}
