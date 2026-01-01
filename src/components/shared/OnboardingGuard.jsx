import { useState } from "react";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import StudentOnboardingModal from "@/features/auth/components/StudentOnboardingModal";
import TeacherOnboardingModal from "@/features/auth/components/TeacherOnboardingModal";
import RoleSelectionModal from "@/features/auth/components/RoleSelectionModal";

export default function OnboardingGuard({ children }) {
  const {
    needsOnboarding: needsStudentOnboarding,
    isLoading: isStudentLoading,
    refreshProfile: refreshStudent,
    profile: studentProfile,
  } = useStudentProfile();

  const {
    needsOnboarding: needsTeacherOnboarding,
    isLoading: isTeacherLoading,
    refreshProfile: refreshTeacher,
    profile: teacherProfile,
  } = useTeacherProfile();

  const [selectedRole, setSelectedRole] = useState(null);

  // Wait for both to load
  if (isStudentLoading || isTeacherLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-body-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-1 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Checking profile...
          </p>
        </div>
      </div>
    );
  }

  // If user has ANY profile (Student OR Teacher), allow access
  const hasProfile = !needsStudentOnboarding || !needsTeacherOnboarding;

  if (hasProfile) {
    return <>{children}</>;
  }

  // If user has NO profile, show Role Selection or specific Onboarding
  if (selectedRole === "student") {
    return (
      <StudentOnboardingModal
        onComplete={() => {
          refreshStudent();
          // Also refresh teacher just in case, though not strictly needed
          refreshTeacher();
        }}
      />
    );
  }

  if (selectedRole === "teacher") {
    return (
      <TeacherOnboardingModal
        onComplete={() => {
          refreshTeacher();
          refreshStudent();
        }}
      />
    );
  }

  // Default: Show Role Selection
  return <RoleSelectionModal onSelect={(role) => setSelectedRole(role)} />;
}
