"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { X, UserPlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestConnection } from "@/services/vocabularyApi";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const { profile } = useTeacherProfile();
  const { getToken } = useAuth();
  const [studentId, setStudentId] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return requestConnection(
        { studentId: studentId.trim(), teacherId: profile.profileId, type: "teacher" },
        token
      );
    },
    onSuccess: () => {
      onSuccess();
      setTimeout(() => {
        handleClose();
      }, 1800);
    },
  });

  const handleClose = () => {
    setStudentId("");
    mutation.reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !profile?.profileId) return;
    mutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Student</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Enter the student's profile ID</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Success state */}
          {mutation.isSuccess && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Request sent!</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  The student will appear in your pending requests.
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {mutation.isError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {(mutation.error as Error)?.message || "Failed to send request. Please try again."}
              </p>
            </div>
          )}

          {!mutation.isSuccess && (
            <>
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Student Profile ID
                </Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. S-123456"
                  disabled={mutation.isPending}
                  className="font-mono"
                  autoFocus
                />
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Ask the student to share their Profile ID from their dashboard.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!studentId.trim() || mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
