
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
import { useProfile } from "@/contexts/ProfileContext";
import TeacherOnboardingModal from "@/features/auth/components/TeacherOnboardingModal";


export default function ProfileMenu() {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const location = useLocation();
    const navigate = useNavigate();
    const { profiles, activeProfile, switchProfile, isLoading } = useProfile();
    const [showTeacherOnboarding, setShowTeacherOnboarding] = useState(false);

    const isTeacher = activeProfile?.role === "teacher";

    // Group profiles by language
    const groupedProfiles = profiles.reduce((acc, p) => {
        const lang = p.language || "Unknown";
        if (!acc[lang]) acc[lang] = [];
        acc[lang].push(p);
        return acc;
    }, {});

    const handleProfileSwitch = (profile) => {
        switchProfile(profile);
        if (profile.role === "teacher") {
            if (location.pathname.startsWith("/dashboard")) {
                navigate("/teacher-dashboard");
            }
        } else {
            if (location.pathname.startsWith("/teacher-dashboard")) {
                navigate("/dashboard");
            }
        }
    };


    if (!user) return null;

    return (
        <>
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

                            {/* Multi-Language Profile Selector */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {Object.entries(groupedProfiles).map(([lang, langProfiles]) => (
                                    <div key={lang} className="border rounded-lg overflow-hidden border-gray-100 dark:border-slate-800">
                                        <div className="bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 border-b border-gray-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">
                                                {lang}
                                            </span>
                                        </div>
                                        <div className="divide-y divide-gray-50 dark:divide-slate-800">
                                            {langProfiles.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleProfileSwitch(p)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800",
                                                        activeProfile?.id === p.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "h-2 w-2 rounded-full",
                                                            p.role === "teacher" ? "bg-emerald-500" : "bg-blue-500"
                                                        )} />
                                                        <span className={cn(
                                                            "text-sm font-medium capitalize",
                                                            activeProfile?.id === p.id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-slate-300"
                                                        )}>
                                                            {p.role} Profile {p.role === "teacher" ? `(${p.profileId})` : ""}
                                                        </span>
                                                    </div>
                                                    {activeProfile?.id === p.id && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => navigate("/onboarding/new-profile")}
                                    className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg text-xs font-bold text-gray-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all active:scale-[0.98]"
                                >
                                    <span>+ Add New Profile</span>
                                </button>
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
            {
                showTeacherOnboarding && (
                    <TeacherOnboardingModal
                        onComplete={() => {
                            setShowTeacherOnboarding(false);
                            refreshTeacherProfile();
                            setRole("teacher");
                            navigate("/teacher-dashboard");
                        }}
                    />
                )
            }
        </>
    );
}

