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
import { getSession } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

const LikesBadgeContext = createContext(null);

function getCurrentUserId(user) {
  return user?.id || getSession()?.id || null;
}

export function LikesBadgeProvider({ children }) {
  const { user } = useAuth();
  const [unseenCount, setUnseenCount] = useState(0);

  const refreshUnseenCount = useCallback(async () => {
    const uid = getCurrentUserId(user);
    if (!uid) {
      setUnseenCount(0);
      return;
    }
    const count = await fetchUnseenLikesCount(uid);
    setUnseenCount(count);
  }, [user]);

  const markSeen = useCallback(() => {
    markLikesAsSeen();
    setUnseenCount(0);
  }, []);

  useEffect(() => {
    refreshUnseenCount();
  }, [refreshUnseenCount]);

  useEffect(() => {
    const uid = getCurrentUserId(user);
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
  }, [user, refreshUnseenCount]);

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
