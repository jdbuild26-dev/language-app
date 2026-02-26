import { useState, useEffect } from "react";
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
  GlobeAltIcon,
  LinkIcon,
  CheckIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useUser();
  const isTeacherUser = user?.publicMetadata?.is_teacher === true;
  const navigate = useNavigate();
  const { profile, updatePrivacy, checkUsername } = useStudentProfile();
  const {
    profile: teacherProfile,
    needsOnboarding: needsTeacherOnboarding,
    refreshProfile: refreshTeacherProfile,
  } = useTeacherProfile();

  const [showTeacherOnboarding, setShowTeacherOnboarding] = useState(false);

  // Privacy State
  const [isPublic, setIsPublic] = useState(profile?.isPublic || false);
  const [username, setUsername] = useState(profile?.username || "");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'taken', 'invalid'
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setIsPublic(profile.isPublic);
      setUsername(profile.username || "");
    }
  }, [profile]);

  const handleUsernameChange = async (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);

    if (value.length < 3) {
      setUsernameStatus(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const res = await checkUsername(value);
      if (res.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (isPublic && (!username || username.length < 3)) {
      toast.error("Please set a valid username for your public profile");
      return;
    }

    setIsUpdatingPrivacy(true);
    try {
      await updatePrivacy({ isPublic, username });
      toast.success("Privacy settings updated!");
    } catch (err) {
      toast.error("Failed to update privacy settings");
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  const copyProfileLink = () => {
    const url = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied!");
  };

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
              {profile?.stats?.tokens ?? 0}
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
            <div className="text-2xl font-bold text-gray-900 dark:text-primary-dark capitalize">
              {profile?.pricingPlan
                ? profile.pricingPlan.replace("-", " ")
                : "Free Plan"}
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
              {user?.primaryEmailAddress?.verification?.status === "verified"
                ? "Verified"
                : "Unverified"}
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
                  {profile?.profileId || "N/A"}
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

      {/* Privacy & Sharing Section */}
      <Card className="border-gray-100 dark:border-subtle-dark shadow-lg bg-white dark:bg-card-dark">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <GlobeAltIcon className="h-6 w-6 text-brand-blue-1" />
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-primary-dark">
              Privacy & Sharing
            </CardTitle>
          </div>
          <CardDescription>
            Control how others see your progress. Make your profile public to
            share your achievements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Toggle Section */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-elevated-2 border border-gray-100 dark:border-subtle-dark">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-primary-dark">
                    Public Profile
                  </p>
                  <p className="text-xs text-gray-500 dark:text-secondary-dark">
                    Allow anyone with the link to see your stats
                  </p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${isPublic ? "bg-brand-blue-1" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              {isPublic && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-dark">
                    Your Profile Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FingerPrintIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      placeholder="choose_a_username"
                      className={`block w-full pl-10 pr-10 py-2 sm:text-sm border rounded-lg bg-white dark:bg-card-dark focus:ring-brand-blue-1 focus:border-brand-blue-1 ${usernameStatus === "taken"
                          ? "border-red-300"
                          : usernameStatus === "available"
                            ? "border-green-300"
                            : "border-gray-200 dark:border-subtle-dark"
                        }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {isCheckingUsername ? (
                        <div className="h-4 w-4 border-2 border-brand-blue-1 border-t-transparent rounded-full animate-spin" />
                      ) : usernameStatus === "available" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : usernameStatus === "taken" ? (
                        <span className="text-[10px] text-red-500 font-bold">
                          TAKEN
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Only letters, numbers, and underscores allowed.
                  </p>
                </div>
              )}
            </div>

            {/* Action Section */}
            <div className="md:w-72 flex flex-col gap-3">
              <Button
                onClick={handleSavePrivacy}
                disabled={
                  isUpdatingPrivacy || (isPublic && usernameStatus === "taken")
                }
                className="w-full bg-brand-blue-1 hover:bg-brand-blue-2 text-white h-11"
              >
                {isUpdatingPrivacy ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Save Settings
              </Button>

              {profile?.username && profile?.isPublic && (
                <Button
                  variant="outline"
                  onClick={copyProfileLink}
                  className="w-full h-11 border-brand-blue-1/20 hover:bg-brand-blue-1/5 text-brand-blue-1"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy Profile Link
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
          {isTeacherUser && (
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
          )}
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
