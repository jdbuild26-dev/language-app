import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import TeacherOnboardingModal from "@/features/auth/components/TeacherOnboardingModal";
import { AcademicCapIcon, UserCircleIcon } from "@heroicons/react/24/outline";

import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import {
  UserGroupIcon,
  XMarkIcon,
  BellIcon,
  UserPlusIcon,
  UsersIcon,
  FireIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LogoSVG, FlagUKSVG, FlagSpainSVG } from "./NavbarIcons";

export default function MobileMenu({
  isOpen,
  setIsOpen,
  activeSection,
  setActiveSection,
  streaks,
  friends,
  notifications,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { needsOnboarding: needsTeacherOnboarding, refreshProfile: refreshTeacherProfile } = useTeacherProfile();
  const [showTeacherOnboarding, setShowTeacherOnboarding] = useState(false);

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
    window.dispatchEvent(new Event("roleChange"));
  }, [role]);

  // Listen for external role changes
  useEffect(() => {
    const handleRoleChange = () => {
      const newRole = localStorage.getItem("active_role") || "learner";
      if (newRole !== role) {
        setRole(newRole);
      }
    };
    window.addEventListener("roleChange", handleRoleChange);
    return () => window.removeEventListener("roleChange", handleRoleChange);
  }, [role]);

  const isTeacher = role === "teacher";

  const toggleRole = () => {
    if (role === "learner") {
      if (needsTeacherOnboarding) {
        setShowTeacherOnboarding(true);
        return;
      }
      const newRole = "teacher";
      setRole(newRole);
      if (location.pathname.startsWith("/dashboard")) {
        navigate("/teacher-dashboard");
        setIsOpen(false);
      }
    } else {
      const newRole = "learner";
      setRole(newRole);
      if (location.pathname.startsWith("/teacher-dashboard")) {
        navigate("/dashboard");
        setIsOpen(false);
      }
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="relative w-full max-w-xs overflow-y-auto bg-white dark:bg-slate-900 pb-12 shadow-2xl">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <LogoSVG />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    LangLearn
                  </span>
                </div>
                <button
                  type="button"
                  className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-500 dark:text-slate-400 hover:bg-brand-blue-3 hover:text-brand-blue-1 focus:outline-none"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 px-6">
                <SignedIn>
                  <div className="space-y-8">
                    {/* Role Toggle Switch Mobile */}
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        toggleRole();
                      }}
                      className={cn(
                        "cursor-pointer relative flex items-center justify-between p-3 rounded-xl transition-colors border select-none",
                        isTeacher
                          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900"
                          : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
                      )}
                    >
                      <div className="flex items-center gap-3 px-2">
                        {isTeacher ? (
                          <AcademicCapIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <UserCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        )}
                        <span
                          className={cn(
                            "text-sm font-bold uppercase tracking-wider",
                            isTeacher
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-blue-700 dark:text-blue-300"
                          )}
                        >
                          {isTeacher ? "Teaching Mode" : "Learning Mode"}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                          isTeacher ? "bg-emerald-500" : "bg-blue-500"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out",
                            isTeacher ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </div>
                    </div>

                    {/* Dashboard Link Mobile */}
                    <Link
                      to={isTeacher ? "/teacher-dashboard" : "/dashboard"}
                      onClick={() => setIsOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        {isTeacher ? (
                          <AcademicCapIcon className="mr-3 h-6 w-6 text-emerald-600" />
                        ) : (
                          <UserGroupIcon className="mr-3 h-6 w-6 text-brand-blue-1" />
                        )}
                        {isTeacher ? "Teacher Dashboard" : "Student Dashboard"}
                      </Button>
                    </Link>


                    {/* Streaks Mobile */}
                    <button
                      onClick={() =>
                        setActiveSection(
                          activeSection === "streak" ? null : "streak"
                        )
                      }
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl p-4 border shadow-sm transition-all",
                        activeSection === "streak"
                          ? "bg-brand-yellow-1 border-brand-yellow-2 ring-2 ring-brand-yellow-2"
                          : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <span className="font-semibold text-gray-700 dark:text-slate-200">
                        Daily Streak
                      </span>
                      <div className="flex items-center gap-2">
                        <FireIcon className="h-6 w-6 text-brand-yellow-3" />
                        <span className="text-xl font-bold text-gray-800 dark:text-slate-100">
                          {streaks}
                        </span>
                      </div>
                    </button>

                    {/* Streak Expanded Content */}

                    {activeSection === "streak" && (
                      <div className="animate-fade-in rounded-xl bg-brand-yellow-1/30 p-4 text-center border border-brand-yellow-1">
                        <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">
                          You're on fire! Keep the streak alive! 🔥
                        </p>
                        <Button
                          size="sm"
                          className="w-full bg-brand-yellow-2 text-gray-900 hover:bg-brand-yellow-3 border-none"
                        >
                          Keep it up!
                        </Button>
                      </div>
                    )}

                    {/* Actions Mobile Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() =>
                          setActiveSection(
                            activeSection === "add" ? null : "add"
                          )
                        }
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                          activeSection === "add"
                            ? "bg-brand-blue-3/20 border-brand-blue-2 ring-1 ring-brand-blue-2"
                            : "border-gray-100 dark:border-slate-700 hover:bg-brand-blue-3/10 hover:border-brand-blue-3 transition-colors"
                        )}
                      >
                        <div className="rounded-full bg-brand-blue-3/50 p-2 text-brand-blue-1">
                          <UserPlusIcon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                          Add
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveSection(
                            activeSection === "friends" ? null : "friends"
                          )
                        }
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                          activeSection === "friends"
                            ? "bg-brand-blue-3/20 border-brand-blue-2 ring-1 ring-brand-blue-2"
                            : "border-gray-100 hover:bg-brand-blue-3/10 hover:border-brand-blue-3"
                        )}
                      >
                        <div className="rounded-full bg-brand-blue-3/50 p-2 text-brand-blue-1">
                          <UsersIcon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                          Friends
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveSection(
                            activeSection === "alerts" ? null : "alerts"
                          )
                        }
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                          activeSection === "alerts"
                            ? "bg-brand-blue-3/20 border-brand-blue-2 ring-1 ring-brand-blue-2"
                            : "border-gray-100 hover:bg-brand-blue-3/10 hover:border-brand-blue-3"
                        )}
                      >
                        <div className="rounded-full bg-brand-blue-3/50 p-2 text-brand-blue-1">
                          <BellIcon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                          Alerts
                        </span>
                      </button>
                    </div>

                    {/* Mobile Action Panels */}
                    <div className="space-y-4">
                      {/* Add Friend Panel */}
                      {activeSection === "add" && (
                        <div className="animate-fade-in rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                          <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
                            Find Friend
                          </h3>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Username"
                              className="h-10 text-sm bg-transparent dark:text-white border-gray-200 dark:border-slate-600"
                            />
                            <Button className="h-10 bg-brand-blue-1 text-white">
                              <MagnifyingGlassIcon className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Friends List Panel */}
                      {activeSection === "friends" && (
                        <div className="animate-fade-in rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                          <div className="flex border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                            <div className="w-1/2 py-2 text-center text-sm font-bold text-brand-blue-1 border-b-2 border-brand-blue-1">
                              Friends
                            </div>
                            <div className="w-1/2 py-2 text-center text-sm font-medium text-gray-500 dark:text-slate-400">
                              Requests
                            </div>
                          </div>
                          <div className="p-2 space-y-1">
                            {friends.map((friend) => (
                              <div
                                key={friend.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                              >
                                <div className="relative">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-1 text-xs font-bold text-white">
                                    {friend.avatar}
                                  </div>
                                  <span
                                    className={cn(
                                      "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                                      friend.status === "online"
                                        ? "bg-green-400"
                                        : "bg-gray-300"
                                    )}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                  {friend.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notifications Panel */}
                      {activeSection === "alerts" && (
                        <div className="animate-fade-in rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
                              Recent
                            </span>
                            <span className="text-xs text-brand-blue-1 font-medium">
                              Clear all
                            </span>
                          </div>
                          <div className="divide-y divide-gray-50 dark:divide-slate-700">
                            {notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={cn(
                                  "px-4 py-3",
                                  notif.unread ? "bg-brand-blue-3/5" : ""
                                )}
                              >
                                <p className="text-sm text-gray-700 dark:text-slate-200">
                                  {notif.text}
                                </p>
                                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                                  {notif.time}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Languages Mobile */}
                    <div className="space-y-4 border-t border-gray-100 dark:border-slate-700 pt-6">
                      <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                        Languages
                      </h3>
                      <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-slate-800">
                        <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                          Known (English)
                        </span>
                        <FlagUKSVG />
                      </div>
                      <div className="flex items-center justify-between rounded-lg p-2 bg-brand-blue-3/10">
                        <span className="text-sm font-bold text-brand-blue-1">
                          Learning (Spanish)
                        </span>
                        <FlagSpainSVG />
                      </div>
                    </div>

                    <div className="py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-medium text-gray-700 dark:text-slate-200">
                        Account
                      </span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                </SignedIn>

                <SignedOut>
                  <div className="flex flex-col space-y-4">
                    <Link to="/sign-in" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/sign-up" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-bold">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </SignedOut>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
      {showTeacherOnboarding && (
        <TeacherOnboardingModal
          onComplete={() => {
            setShowTeacherOnboarding(false);
            refreshTeacherProfile();
            setRole("teacher");
            navigate("/teacher-dashboard");
            setIsOpen(false);
          }}
        />
      )}
    </Transition>

  );
}
