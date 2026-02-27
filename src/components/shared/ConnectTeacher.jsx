import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import {
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useStudentTeachers } from "@/hooks/useStudentTeachers";

import {
  deleteRelationship,
  linkStudentToTeacher,
} from "@/services/vocabularyApi";

export default function ConnectTeacher() {
  const { profile } = useStudentProfile();
  const {
    data: teachers,
    isLoading: isLoadingTeachers,
    refetch: refetchTeachers,
  } = useStudentTeachers();
  const [teacherId, setTeacherId] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return linkStudentToTeacher(profile.profileId, teacherId, token);
    },
    onSuccess: () => {
      setStatus("success");
      setTeacherId("");
      refetchTeachers(); // Refresh the list of teachers
      setTimeout(() => setStatus("idle"), 3000);
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teacherId || !profile?.profileId) return;
    setStatus("loading");
    mutation.mutate();
  };

  const handleDelete = async (relationshipId) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      const token = await window.Clerk.session.getToken();
      await deleteRelationship(relationshipId, token);
      refetchTeachers();
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to remove connection");
    }
  };

  if (!profile) return null;

  return (
    <Card className="border-gray-100 dark:border-subtle-dark shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-primary-dark">
          <UserPlusIcon className="h-5 w-5 text-brand-blue-1" />
          Classroom Connection
        </CardTitle>
        <CardDescription>
          Connect with your teacher to join their virtual classroom.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Teachers List */}
        {teachers && teachers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Teachers
            </h4>
            <div className="space-y-2">
              {teachers.map((teacher) => (
                <div
                  key={teacher.teacherId}
                  className="flex items-center gap-3 p-3 bg-brand-blue-3/10 rounded-lg border border-brand-blue-3/20"
                >
                  <div className="p-2 bg-white dark:bg-card-dark rounded-full shadow-sm">
                    <AcademicCapIcon className="h-4 w-4 text-brand-blue-1" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-primary-dark">
                      Teacher {teacher.teacherId}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-secondary-dark">
                      Connected since{" "}
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {teacher.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        <ClockIcon className="h-3 w-3" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Active
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-500"
                      onClick={() => handleDelete(teacher.id)}
                      title="Remove connection"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Form */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {teachers && teachers.length > 0
              ? "Connect Another Teacher"
              : "Connect with a Teacher"}
          </h4>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <Input
                placeholder="Enter Teacher ID (e.g. T-123456)"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={status === "loading" || status === "success"}
              />
            </div>
            <Button
              type="submit"
              disabled={
                !teacherId || status === "loading" || status === "success"
              }
            >
              {status === "loading" ? "Connecting..." : "Connect"}
            </Button>
          </form>

          {status === "success" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-2 rounded-md">
              <CheckCircleIcon className="h-4 w-4" />
              Successfully connected to teacher!
            </div>
          )}

          {status === "error" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded-md">
              <ExclamationCircleIcon className="h-4 w-4" />
              {errorMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
