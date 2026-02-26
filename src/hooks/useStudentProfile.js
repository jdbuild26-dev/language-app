import { useProfile } from "../contexts/ProfileContext";
import { updatePrivacySettings, checkUsernameAvailability } from "../services/userApi";
import { useAuth } from "@clerk/clerk-react";

/**
 * Hook to manage student profile state and onboarding status.
 * @returns {Object} { studentAllowed, needsOnboarding, profile, isLoading, refreshProfile }
 */
export function useStudentProfile() {
  const { activeProfile, profiles, isLoading, refreshProfiles } = useProfile();
  const { getToken } = useAuth();

  const isStudent = activeProfile?.role === "student";
  const needsOnboarding = profiles.length === 0;

  const updatePrivacy = async (privacyData) => {
    const token = await getToken();
    return await updatePrivacySettings(privacyData, token);
  };

  const checkUsername = async (username) => {
    const token = await getToken();
    return await checkUsernameAvailability(username, token);
  };

  return {
    needsOnboarding,
    profile: isStudent ? activeProfile : null,
    isLoading,
    refreshProfile: refreshProfiles,
    updatePrivacy,
    checkUsername,
  };
}
