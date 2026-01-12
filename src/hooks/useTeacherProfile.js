import { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  checkTeacherOnboardingStatus,
  getTeacherProfile,
} from "../services/userApi";

/**
 * Hook to manage teacher profile state and onboarding status.
 * @returns {Object} { needsOnboarding, profile, isLoading, refreshProfile }
 */
export function useTeacherProfile() {
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
      const status = await checkTeacherOnboardingStatus(token);

      if (status.isComplete) {
        setNeedsOnboarding(false);
        // Fetch full profile if complete
        const fullProfile = await getTeacherProfile(token);
        setProfile(fullProfile);
      } else {
        setNeedsOnboarding(true);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error checking teacher status:", error);
      // Do NOT force onboarding on error.
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
