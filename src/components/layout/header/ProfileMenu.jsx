
import { useState, useEffect, Fragment } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Menu, Transition } from "@headlessui/react";
import {
    UserCircleIcon,
    AcademicCapIcon,
    PresentationChartLineIcon,
    CreditCardIcon,
    ArrowRightStartOnRectangleIcon,
    BookOpenIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ProfileMenu() {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize role from localStorage or default to 'learner'
    const [role, setRole] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("active_role") || "learner";
        }
        return "learner";
    });

    // Persist role changes
    useEffect(() => {
        localStorage.setItem("active_role", role);
        // Dispatch a custom event so other components can listen for role changes
        window.dispatchEvent(new Event("roleChange"));
    }, [role]);

    const isTeacher = role === "teacher";

    const toggleRole = () => {
        const newRole = role === "learner" ? "teacher" : "learner";
        setRole(newRole);

        // Redirect logic: Switch dashboards if on the main dashboard page
        if (newRole === "teacher" && location.pathname === "/dashboard") {
            navigate("/teacher-dashboard");
        } else if (newRole === "learner" && location.pathname === "/teacher-dashboard") {
            navigate("/dashboard");
        }
    };

    if (!user) return null;

    return (
        <Menu as="div" className="relative ml-3 flex items-center gap-3">
            {/* Teaching Mode Badge (Visible in Navbar) */}
            {isTeacher && (
                <span className="hidden lg:inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm animate-pulse-slow whitespace-nowrap">
                    Teaching Mode
                </span>
            )}

            <div>
                <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-transform active:scale-95">
                    <span className="sr-only">Open user menu</span>
                    <img
                        className={cn(
                            "h-9 w-9 rounded-full border-2 transition-all object-cover",
                            isTeacher ? "border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" : "border-brand-blue-2"
                        )}
                        src={user.imageUrl}
                        alt={user.fullName || "User avatar"}
                    />
                    {/* Status Badge Indicator (Small dot) */}
                    <div className={cn(
                        "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm",
                        isTeacher ? "bg-emerald-500" : "bg-brand-blue-2"
                    )}>
                        {isTeacher ? "T" : "L"}
                    </div>
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 top-full z-10 mt-2 w-80 origin-top-right rounded-xl bg-white dark:bg-slate-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-800">

                    {/* Header Section */}
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={user.imageUrl}
                                className="h-10 w-10 rounded-full border border-gray-200 dark:border-slate-700"
                                alt=""
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {user.fullName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                    {user.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                        </div>

                        {/* Role Toggle Switch */}
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                toggleRole();
                            }}
                            className={cn(
                                "cursor-pointer relative flex items-center justify-between p-1 rounded-lg transition-colors border select-none",
                                isTeacher
                                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900"
                                    : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
                            )}
                        >
                            <div className="flex items-center gap-2 px-2">
                                {isTeacher ? (
                                    <AcademicCapIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <UserCircleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                )}
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    isTeacher ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"
                                )}>
                                    {isTeacher ? "Teaching Mode" : "Learning Mode"}
                                </span>
                            </div>

                            {/* Toggle Visual */}
                            <div className={cn(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                                isTeacher ? "bg-emerald-500" : "bg-blue-500"
                            )}>
                                <span
                                    className={cn(
                                        "inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out",
                                        isTeacher ? "translate-x-5" : "translate-x-1"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Section - Only for Learners */}
                    {!isTeacher && (
                        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                    ⚡
                                </span>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Tokens</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">150</p>
                                </div>
                            </div>
                            <button className="text-xs font-medium text-brand-blue-1 dark:text-blue-400 hover:underline">
                                Buy More
                            </button>
                        </div>
                    )}

                    {/* Shortcuts Section - Context Aware */}
                    <div className="py-1">
                        {isTeacher ? (
                            <>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/teacher-dashboard"
                                            className={cn(
                                                active ? 'bg-gray-100 dark:bg-slate-800' : '',
                                                'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300'
                                            )}
                                        >
                                            <PresentationChartLineIcon className="h-5 w-5 text-gray-400" />
                                            Student Analytics
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/assignments/create"
                                            className={cn(
                                                active ? 'bg-gray-100 dark:bg-slate-800' : '',
                                                'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300'
                                            )}
                                        >
                                            <BookOpenIcon className="h-5 w-5 text-gray-400" />
                                            Assignment Creator
                                        </Link>
                                    )}
                                </Menu.Item>
                            </>
                        ) : (
                            <>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/dashboard/progress"
                                            className={cn(
                                                active ? 'bg-gray-100 dark:bg-slate-800' : '',
                                                'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300'
                                            )}
                                        >
                                            <ChartBarIcon className="h-5 w-5 text-gray-400" />
                                            My Progress
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/practice"
                                            className={cn(
                                                active ? 'bg-gray-100 dark:bg-slate-800' : '',
                                                'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300'
                                            )}
                                        >
                                            <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                                            Practice More
                                        </Link>
                                    )}
                                </Menu.Item>
                            </>
                        )}
                    </div>

                    {/* Footer Section - Settings & Logout */}
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => openUserProfile()}
                                    className={cn(
                                        active ? 'bg-gray-100 dark:bg-slate-800' : '',
                                        'w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300'
                                    )}
                                >
                                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                                    Manage Account
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => signOut({ redirectUrl: '/' })}
                                    className={cn(
                                        active ? 'bg-gray-100 dark:bg-slate-800' : '',
                                        'w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400'
                                    )}
                                >
                                    <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-red-400" />
                                    Sign Out
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
