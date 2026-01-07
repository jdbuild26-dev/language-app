import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useStudentProfile } from "./useStudentProfile";
import { fetchStudentTeachers } from "@/services/vocabularyApi";

export function useStudentTeachers() {
  const { profile } = useStudentProfile();
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["student-teachers", profile?.studentId],
    queryFn: async () => {
      const token = await getToken();
      return fetchStudentTeachers(profile?.studentId, null, token);
    },
    enabled: !!profile?.studentId,
  });
}
