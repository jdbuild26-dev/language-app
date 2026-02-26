import { Navigate, useLocation } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";

export default function OnboardingGuard({ children }) {
  const location = useLocation();
  const { profiles, isLoading, activeProfile } = useProfile();

  const isTeacherRoute = location.pathname.startsWith("/teacher-dashboard");
  const isStudentRoute = location.pathname.startsWith("/dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400 font-medium">
            Fetching your profiles...
          </p>
        </div>
      </div>
    );
  }

  // If user has NO profiles at all, redirect to the new multi-profile onboarding
  if (profiles.length === 0) {
    // Prevent infinite redirect loop
    if (location.pathname.startsWith("/onboarding")) {
      return <>{children}</>;
    }
    return <Navigate to="/onboarding/new-profile" replace />;
  }

  // If on a teacher route but active profile is not a teacher
  if (isTeacherRoute && activeProfile?.role !== "teacher") {
    // Check if they HAVE a teacher profile at all
    const hasTeacherProfile = profiles.some(p => p.role === "teacher");
    if (!hasTeacherProfile) {
      return <Navigate to="/onboarding/new-profile?role=teacher" replace />;
    }
    // If they have one but it's not active, the switcher in ProfileMenu should handle it,
    // but for the guard, we might want to redirect them to a student dashboard or something.
    // However, usually the user clicks a link. For now, let's keep it simple.
  }

  // If on a student route but active profile is not a student
  if (isStudentRoute && activeProfile?.role !== "student") {
    const hasStudentProfile = profiles.some(p => p.role === "student");
    if (!hasStudentProfile) {
      return <Navigate to="/onboarding/new-profile?role=student" replace />;
    }
  }

  return <>{children}</>;
}
