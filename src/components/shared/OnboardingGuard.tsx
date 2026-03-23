"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profiles, isLoading, activeProfile } = useProfile();

  const isTeacherRoute = pathname.startsWith("/teacher-dashboard");
  const isStudentRoute = pathname.startsWith("/dashboard");
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (isLoading) return;

    if (profiles.length === 0 && !isOnboardingRoute) {
      router.replace("/onboarding/new-profile");
      return;
    }

    if (isTeacherRoute && activeProfile?.role !== "teacher") {
      const hasTeacherProfile = profiles.some(p => p.role === "teacher");
      if (!hasTeacherProfile) {
        router.replace("/onboarding/new-profile?role=teacher");
      }
    }

    if (isStudentRoute && activeProfile?.role !== "student") {
      const hasStudentProfile = profiles.some(p => p.role === "student");
      if (!hasStudentProfile) {
        router.replace("/onboarding/new-profile?role=student");
      }
    }
  }, [isLoading, profiles, activeProfile, pathname, isTeacherRoute, isStudentRoute, isOnboardingRoute, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400 font-medium">Fetching your profiles...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
