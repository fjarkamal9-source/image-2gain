import { useMemo } from 'react';
import { getUserProfile } from '../utils/completeOnboarding';
import { computeProfileCompletion } from '../utils/profileCompletion';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user } = useAuth();
  const profile = useMemo(() => getUserProfile(), [user]);
  const completion = useMemo(() => computeProfileCompletion(), [profile]);

  return { profile, completion, user };
}
