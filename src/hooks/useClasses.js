import { useQuery } from "@tanstack/react-query";
import { fetchClasses, fetchClassDetails } from "../services/vocabularyApi";
import { useAuth } from "@clerk/clerk-react";

export function useClasses() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      if (!isLoaded || !isSignedIn) return [];
      const token = await getToken();
      return fetchClasses(token);
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useClassDetails(classId) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["classes", classId],
    queryFn: async () => {
      if (!isLoaded || !isSignedIn || !classId) return null;
      const token = await getToken();
      return fetchClassDetails(classId, token);
    },
    enabled: isLoaded && isSignedIn && !!classId,
    staleTime: 5 * 60 * 1000,
  });
}
