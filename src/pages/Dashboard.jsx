import { useUser } from "@clerk/clerk-react";
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
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Welcome back,{" "}
            <span className="text-brand-blue-1">
              {user?.firstName || "User"}
            </span>
            ! 👋
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl">
            Track your progress, manage your account, and explore new learning
            opportunities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Account Status
              </CardTitle>
              <div className="h-4 w-4 text-green-500">
                <ShieldCheckIcon />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">Active</div>
              <p className="text-xs text-gray-400 mt-1">
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
              <div className="text-2xl font-bold text-gray-900">Persistent</div>
              <p className="text-xs text-gray-400 mt-1">
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
              <div className="text-2xl font-bold text-gray-900">Protected</div>
              <p className="text-xs text-gray-400 mt-1">
                Enterprise-grade security
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card */}
        <Card className="border-gray-100 shadow-lg bg-white overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue-1 to-brand-blue-2" />
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Your Profile
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
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
                <p className="text-xl font-bold text-gray-900">
                  {user?.fullName || "User"}
                </p>
                <div className="flex items-center gap-2 text-gray-500">
                  <UserIcon className="h-4 w-4" />
                  <p className="text-sm">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  User ID
                </p>
                <p className="font-mono text-xs bg-gray-50 p-2 rounded-md text-gray-600 break-all border border-gray-100">
                  {user?.id}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Member Since
                </p>
                <p className="text-sm font-medium text-gray-700">
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

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed"
            >
              <div className="p-2 rounded-full bg-brand-blue-3/30 text-brand-blue-1">
                <PencilSquareIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Update your personal details
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed"
            >
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Cog6ToothIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage account preferences
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-4 hover:border-brand-blue-1 hover:bg-brand-blue-3/10 transition-all border-dashed"
            >
              <div className="p-2 rounded-full bg-brand-yellow-1 text-brand-yellow-3 border border-brand-yellow-2">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Documentation</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Learn how to use the platform
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
