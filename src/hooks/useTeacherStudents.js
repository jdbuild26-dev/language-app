import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useTeacherProfile } from "./useTeacherProfile";
import { fetchTeacherStudents } from "@/services/vocabularyApi";

export function useTeacherStudents(status) {
  const { profile } = useTeacherProfile();
  const { getToken } = useAuth();

  // We only fetch if we have a profile and specifically a profileId
  return useQuery({
    queryKey: ["teacher-students", profile?.profileId, status],
    queryFn: async () => {
      const token = await getToken();
      return fetchTeacherStudents(profile?.profileId, status, token);
    },
    enabled: !!profile?.profileId,
  });
}
