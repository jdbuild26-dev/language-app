import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import TeacherOnboardingModal from "@/features/auth/components/TeacherOnboardingModal";
import ConnectTeacher from "@/components/shared/ConnectTeacher";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  PencilSquareIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

export default function ProgressReportPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { profile } = useStudentProfile();
  const {
    profile: teacherProfile,
    needsOnboarding: needsTeacherOnboarding,
    refreshProfile: refreshTeacherProfile,
  } = useTeacherProfile();
  const [showTeacherOnboarding, setShowTeacherOnboarding] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-body-dark">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-primary-dark">
            Welcome back,{" "}
            <span className="text-brand-blue-1">
              {user?.firstName || "User"}
            </span>
            ! 👋
          </h1>
          <p className="text-xl text-gray-500 dark:text-secondary-dark max-w-2xl">
            Track your progress, manage your account, and explore new learning
            opportunities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-gray-100 dark:border-subtle-dark dark:bg-card-dark shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-dark">
                Account Status
              </CardTitle>
              <div className="h-4 w-4 text-green-500">
                <ShieldCheckIcon />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
                Active
              </div>
              <p className="text-xs text-gray-400 dark:text-secondary-dark mt-1">
                Your account is verified
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sessions
              </CardTitle>
              <div className="h-4 w-4 text-brand-blue-1">
                <ClockIcon />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
                Persistent
              </div>
              <p className="text-xs text-gray-400 dark:text-secondary-dark mt-1">
                Stay logged in forever
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Security
              </CardTitle>
              <div className="h-4 w-4 text-brand-yellow-2">
                <ShieldCheckIcon />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
                Protected
              </div>
              <p className="text-xs text-gray-400 dark:text-secondary-dark mt-1">
                Enterprise-grade security
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card */}
        <Card className="border-gray-100 dark:border-subtle-dark shadow-lg bg-white dark:bg-card-dark overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue-1 to-brand-blue-2" />
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
                  Your Profile
                </CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </div>
              {profile && (
                <div className="flex items-center gap-2 bg-brand-blue-1/10 text-brand-blue-1 px-3 py-1 rounded-full text-sm font-semibold">
                  <span className="uppercase">{profile.targetLanguage}</span>
                  <span className="text-gray-300">|</span>
                  <span>{profile.level}</span>
                </div>
              )}
              {teacherProfile && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <span className="uppercase">Teacher</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user?.imageUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full ring-4 ring-gray-50 border-2 border-white shadow-sm"
                />
                <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-400 border-2 border-white"></div>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-primary-dark">
                  {user?.fullName || "User"}
                </p>
                <div className="flex items-center gap-2 text-gray-500 dark:text-secondary-dark">
                  <UserIcon className="h-4 w-4" />
                  <p className="text-sm">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                {profile && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.purpose.map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-gray-100 dark:bg-elevated-2 text-gray-600 dark:text-secondary-dark px-2 py-0.5 rounded-md border border-gray-200 dark:border-subtle-dark"
                      >
                        {p}
                      </span>
                    ))}
                    {profile.examIntent?.hasExam && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                        Target: {profile.examIntent.examType}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-subtle-dark">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-dark">
                    Student ID
                  </p>
                  <p className="font-mono text-xs bg-gray-50 dark:bg-elevated-2 p-2 rounded-md text-gray-600 dark:text-secondary-dark break-all border border-gray-100 dark:border-subtle-dark">
                    {profile?.studentId || "N/A"}
                  </p>
                </div>
                {teacherProfile && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-dark">
                      Teacher ID
                    </p>
                    <p className="font-mono text-xs bg-green-50 dark:bg-green-900/10 p-2 rounded-md text-green-700 dark:text-green-400 break-all border border-green-100 dark:border-green-800/20">
                      {teacherProfile.teacherId}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-dark">
                  Member Since
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-primary-dark">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classroom Connection */}
        <div className="grid md:grid-cols-2 gap-6">
          <ConnectTeacher />
          {/* Placeholder for future assigned tasks or classroom updates */}
          <Card className="border-gray-100 dark:border-subtle-dark shadow-sm bg-gray-50 dark:bg-card-dark flex items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-primary-dark">
                Assigned Tasks
              </p>
              <p className="text-sm text-gray-500">No tasks assigned yet.</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-primary-dark">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary"
            >
              <div className="p-2 rounded-full bg-brand-blue-3/30 text-brand-blue-1">
                <PencilSquareIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                  Edit Profile
                </h3>
                <p className="text-xs text-gray-500 dark:text-secondary-dark mt-1">
                  Update your personal details
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary"
            >
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                <Cog6ToothIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                  Settings
                </h3>
                <p className="text-xs text-gray-500 dark:text-secondary-dark mt-1">
                  Manage account preferences
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary"
            >
              <div className="p-2 rounded-full bg-brand-yellow-1 text-brand-yellow-3 border border-brand-yellow-2 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                  Documentation
                </h3>
                <p className="text-xs text-gray-500 dark:text-secondary-dark mt-1">
                  Learn how to use the platform
                </p>
              </div>
            </Button>

            {/* Teacher Action */}
            <Button
              variant="outline"
              onClick={() => {
                if (needsTeacherOnboarding) {
                  setShowTeacherOnboarding(true);
                } else {
                  navigate("/teacher-dashboard");
                }
              }}
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary"
            >
              <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                  {needsTeacherOnboarding
                    ? "Become a Teacher"
                    : "Teacher Dashboard"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-secondary-dark mt-1">
                  {needsTeacherOnboarding
                    ? "Start teaching on platform"
                    : "Manage your classes"}
                </p>
              </div>
            </Button>

            {/* Find Teacher Action */}
            <Button
              variant="outline"
              onClick={() => navigate("/find-teacher")}
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed dark:border-subtle-dark dark:hover:border-accent-primary"
            >
              <div className="p-2 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
                <UserPlusIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-primary-dark">
                  Find a Teacher
                </h3>
                <p className="text-xs text-gray-500 dark:text-secondary-dark mt-1">
                  Connect with a mentor
                </p>
              </div>
            </Button>
          </div>
        </div>

        {showTeacherOnboarding && (
          <TeacherOnboardingModal
            onComplete={() => {
              setShowTeacherOnboarding(false);
              refreshTeacherProfile();
            }}
          />
        )}
      </div>
    </div>
  );
}
