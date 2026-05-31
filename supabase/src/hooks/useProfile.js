import { useEffect, useMemo, useState } from 'react';
import { getUserProfile } from '../utils/completeOnboarding';
import { computeProfileCompletion } from '../utils/profileCompletion';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getUserProfile().then((p) => {
      if (!cancelled) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const completion = useMemo(() => computeProfileCompletion(profile), [profile]);

  return { profile, completion, user };
}
