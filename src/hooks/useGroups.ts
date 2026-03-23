import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  getTeacherGroups,
  getGroupDetails,
  addStudentsToGroup,
  removeStudentFromGroup,
  deleteGroup,
} from "@/services/groupsApi";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

export function useTeacherGroups() {
  const { profile, isLoading: isProfileLoading } = useTeacherProfile();
  const teacherId = profile?.teacherId;

  return useQuery({
    queryKey: ["teacher-groups", teacherId],
    queryFn: () => getTeacherGroups(teacherId),
    enabled: !!teacherId,
  });
}

export function useGroupDetails(groupId) {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { profile } = useTeacherProfile();

  return useMutation({
    mutationFn: (groupData) => {
      // Access teacherId from the profile in the closure at the time of execution
      // Ideally this closure should be fresh, but if not, we rely on the object reference or re-render
      // Better: we can inspect the profile object directly if it's mutable or stable
      const teacherId = profile?.teacherId;

      if (!teacherId) {
        console.error(
          "Attempted to create group without teacher ID. Profile:",
          profile
        );
        throw new Error(
          "Teacher ID not found. Please try refreshing the page."
        );
      }
      return createGroup({ ...groupData, teacherId });
    },
    onSuccess: (data) => {
      // Invalidate queries using the teacherId from the response to be safe
      queryClient.invalidateQueries(["teacher-groups", data.teacherId]);
    },
  });
}

export function useAddStudentsToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, studentIds }) =>
      addStudentsToGroup(groupId, studentIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["group", variables.groupId]);
      // Also invalidate list as student count changes
      queryClient.invalidateQueries(["teacher-groups"]);
    },
  });
}

export function useRemoveStudentFromGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, studentId }) =>
      removeStudentFromGroup(groupId, studentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["group", variables.groupId]);
      queryClient.invalidateQueries(["teacher-groups"]);
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const { profile } = useTeacherProfile();
  const teacherId = profile?.teacherId;

  return useMutation({
    mutationFn: (groupId) => deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-groups", teacherId]);
    },
  });
}
