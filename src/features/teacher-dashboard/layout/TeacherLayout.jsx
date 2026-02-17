import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Overview", href: "/teacher-dashboard", icon: HomeIcon },
  {
    name: "My Students",
    href: "/teacher-dashboard/students",
    icon: UserGroupIcon,
  },
  { name: "Classes", href: "/teacher-dashboard/classes", icon: UserGroupIcon }, // Reusing icon for now or changing to Calendar
  { name: "Calendar", href: "/teacher-dashboard/calendar", icon: CalendarIcon },
  {
    name: "Assignments",
    href: "/teacher-dashboard/assignments",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    name: "Referral",
    href: "/teacher-dashboard/referral",
    icon: UserGroupIcon,
  }, // Placeholder icon
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TeacherLayout() {
  const location = useLocation();
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-body-dark flex flex-col">
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
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

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                localStorage.setItem("active_role", "learner");
                window.dispatchEvent(new Event("roleChange"));
                navigate("/dashboard");
              }}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChartBarIcon
                className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              <span className="truncate">Student Dashboard</span>
            </button>
          </div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
