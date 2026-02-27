import { useProfile } from "../contexts/ProfileContext";

/**
 * Hook to manage teacher profile state and onboarding status.
 * @returns {Object} { needsOnboarding, profile, isLoading, refreshProfile }
 */
export function useTeacherProfile() {
  const { activeProfile, profiles, isLoading, refreshProfiles } = useProfile();

  const isTeacher = activeProfile?.role === "teacher";
  const needsOnboarding = profiles.filter(p => p.role === "teacher").length === 0;

  return {
    needsOnboarding,
    profile: isTeacher ? activeProfile : null,
    isLoading,
    refreshProfile: refreshProfiles,
  };
}
