import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  UserCircleIcon,
  BookOpenIcon,
  ChartBarIcon,
  GiftIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useProfile } from "@/contexts/ProfileContext";

const navigation = [
  { name: "Profile", href: "/dashboard", icon: UserCircleIcon, end: true },
  {
    name: "My Teachers",
    href: "/dashboard/teachers",
    icon: AcademicCapIcon,
  },
  {
    name: "Friends",
    href: "/dashboard/friends",
    icon: UserGroupIcon,
  },
  {
    name: "Assignments",
    href: "/dashboard/assignments",
    icon: BookOpenIcon,
  },
  {
    name: "Progress Report",
    href: "/dashboard/progress",
    icon: ChartBarIcon,
  },
  {
    name: "Referral",
    href: "/dashboard/referral",
    icon: GiftIcon,
  },
];


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { profiles, switchProfile, activeProfile } = useProfile();
  const isTeacherUser = profiles.some(p => p.role === "teacher");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-body-dark flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.end
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    isActive
                      ? "bg-brand-blue-1 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon
                    className={classNames(
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500",
                      "flex-shrink-0 -ml-1 mr-3 h-6 w-6",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {isTeacherUser && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  const teacherProfile = profiles.find(p => p.role === "teacher" && p.language === activeProfile.language);
                  if (teacherProfile) {
                    switchProfile(teacherProfile);
                    navigate("/teacher-dashboard");
                  } else {
                    navigate(`/onboarding/new-profile?role=teacher&lang=${activeProfile.language}`);
                  }
                }}
                className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <AcademicCapIcon
                  className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                <span className="truncate">Teacher Dashboard</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Navigation (Tabs) */}
        <div className="lg:hidden mb-6 overflow-x-auto">
          <nav className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            {navigation.map((item) => {
              const isActive = item.end
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    isActive
                      ? "border-brand-blue-1 text-brand-blue-1"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                    "whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm flex items-center",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon
                    className={classNames(
                      isActive
                        ? "text-brand-blue-1"
                        : "text-gray-400 group-hover:text-gray-500",
                      "flex-shrink-0 -ml-1 mr-2 h-5 w-5",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
