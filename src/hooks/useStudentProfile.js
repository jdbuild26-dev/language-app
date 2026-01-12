import { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { checkOnboardingStatus, getStudentProfile } from "../services/userApi";

/**
 * Hook to manage student profile state and onboarding status.
 * @returns {Object} { studentAllowed, needsOnboarding, profile, isLoading, refreshProfile }
 */
export function useStudentProfile() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { getToken } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      // Check onboarding status
      const status = await checkOnboardingStatus(token);

      if (status.isComplete) {
        setNeedsOnboarding(false);
        // Fetch full profile if complete
        const fullProfile = await getStudentProfile(token);
        setProfile(fullProfile);
      } else {
        setNeedsOnboarding(true);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error checking student status:", error);
      // Do NOT force onboarding on error. Keep previous state (likely false).
      // This prevents transient errors (500s, network) from triggering the onboarding flow.
    } finally {
      setIsLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (isClerkLoaded) {
      if (user) {
        checkStatus();
      } else {
        setIsLoading(false);
      }
    }
  }, [isClerkLoaded, user, checkStatus]);

  return {
    needsOnboarding,
    profile,
    isLoading: !isClerkLoaded || isLoading,
    refreshProfile: checkStatus,
  };
}
