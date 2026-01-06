import { useQuery } from "@tanstack/react-query";
import { useTeacherProfile } from "./useTeacherProfile";

async function fetchTeacherStudents(teacherId, status) {
  if (!teacherId) return [];

  const params = new URLSearchParams();
  if (status) params.append("status", status);

  // Using the endpoint we created: GET /relationships/teacher/{teacherId}/students
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }/api/relationships/teacher/${teacherId}/students?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
}

export function useTeacherStudents(status) {
  const { profile } = useTeacherProfile();

  // We only fetch if we have a profile and specifically a teacherId
  return useQuery({
    queryKey: ["teacher-students", profile?.teacherId, status],
    queryFn: () => fetchTeacherStudents(profile?.teacherId, status),
    enabled: !!profile?.teacherId,
  });
}
