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
  CreditCardIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-primary-dark">
          Welcome back,{" "}
          <span className="text-brand-blue-1">{user?.firstName || "User"}</span>
          ! 👋
        </h1>
        <p className="text-lg text-gray-500 dark:text-secondary-dark">
          Manage your account and subscription details here.
        </p>
      </div>

      {/* Subscription & Tokens Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tokens Card */}
        <Card className="border-brand-yellow-2/30 bg-brand-yellow-1/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-yellow-3">
              Tokens Pending
            </CardTitle>
            <div className="h-4 w-4 text-brand-yellow-2">
              <SparklesIcon />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
              150
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available for AI practice
            </p>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="border-brand-purple-2/30 bg-purple-50 dark:bg-purple-900/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Subscription
            </CardTitle>
            <div className="h-4 w-4 text-purple-500">
              <CreditCardIcon />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
              Pro Plan
            </div>
            <p className="text-xs text-green-600 mt-1">
              Active • Expires Mar 2026
            </p>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="border-gray-100 dark:border-subtle-dark dark:bg-card-dark shadow-sm">
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
              Verified
            </div>
            <p className="text-xs text-gray-400 dark:text-secondary-dark mt-1">
              Student Account
            </p>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card className="border-gray-100 dark:border-subtle-dark dark:bg-card-dark shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-dark">
              Last Login
            </CardTitle>
            <div className="h-4 w-4 text-blue-500">
              <ClockIcon />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
              Today
            </div>
            <p className="text-xs text-gray-400 dark:text-secondary-dark mt-1">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
                Personal Details
              </CardTitle>
              <CardDescription>
                Your profile information visible to teachers
              </CardDescription>
            </div>
            {profile && (
              <div className="flex items-center gap-2 bg-brand-blue-1/10 text-brand-blue-1 px-3 py-1 rounded-full text-sm font-semibold">
                <span className="uppercase">{profile.targetLanguage}</span>
                <span className="text-gray-300">|</span>
                <span>{profile.level}</span>
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
              {/* Dummy Profile Details */}
              <div className="mt-2 text-sm text-gray-500 dark:text-secondary-dark flex gap-4">
                <span>📞 +1 (555) 123-4567</span>
                <span>📍 New York, USA</span>
                <span>🕒 GMT-5</span>
              </div>
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
      <ConnectTeacher />

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
  );
}
