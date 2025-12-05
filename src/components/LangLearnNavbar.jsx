import { Fragment, useState } from "react";
import { Menu, Transition, Dialog, Popover, Tab } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserPlusIcon,
  UsersIcon,
  FireIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const streaks = 12;
const friends = [
  { id: 1, name: "Alice", avatar: "A", status: "online" },
  { id: 2, name: "Bob", avatar: "B", status: "offline" },
  { id: 3, name: "Charlie", avatar: "C", status: "online" },
];
const friendRequests = [
  { id: 4, name: "David", avatar: "D" },
  { id: 5, name: "Eve", avatar: "E" },
];
const notifications = [
  {
    id: 1,
    text: "You received a request from David",
    time: "2m ago",
    unread: true,
  },
  { id: 2, text: "You kept your streak!", time: "1h ago", unread: false },
];

// --- SVGs ---

const LogoSVG = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-brand-blue-1"
  >
    <rect
      width="32"
      height="32"
      rx="10"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path
      d="M16 4L28 28H4L16 4Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="18" r="4" fill="white" />
  </svg>
);

const FlagUKSVG = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 60 30"
    className="rounded-full shadow-sm object-cover"
  >
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path
      d="M0,0 L60,30 M60,0 L0,30"
      clipPath="url(#t)"
      stroke="#cf142b"
      strokeWidth="4"
    />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
  </svg>
);

const FlagSpainSVG = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 750 500"
    className="rounded-full shadow-sm object-cover"
  >
    <rect width="750" height="500" fill="#c60b1e" />
    <rect y="125" width="750" height="250" fill="#ffc400" />
  </svg>
);

// --- Component ---

export default function LangLearnNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState(null);

  return (
    <nav className="sticky top-0 z-50 h-[72px] w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Brand */}
        <Link to="/" className="flex items-center gap-3.5">
          <LogoSVG />
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            LangLearn
          </span>
        </Link>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex md:items-center md:gap-5">
          <SignedIn>
            {/* Streaks Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 rounded-full bg-brand-yellow-1/50 px-4 py-1.5 text-sm font-bold text-gray-700 border border-brand-yellow-2 hover:bg-brand-yellow-1 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow-2 focus:ring-offset-2">
                <FireIcon className="h-5 w-5 text-brand-yellow-3 drop-shadow-sm" />
                <span>{streaks}</span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-1"
              >
                <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 focus:outline-none">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow-1 mb-3">
                      <FireIcon className="h-8 w-8 text-brand-yellow-3" />
                    </div>
                    <p className="text-sm text-gray-600">
                      You have maintained a streak for{" "}
                      <span className="font-bold text-gray-900">
                        {streaks} days
                      </span>
                      !
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-brand-yellow-2 text-gray-900 hover:bg-brand-yellow-3 border-none"
                    >
                      Keep it up!
                    </Button>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <div className="h-6 w-px bg-gray-200" />

            {/* Action Buttons Group */}
            <div className="flex items-center gap-3">
              {/* Add Friend Popover */}
              <Popover className="relative">
                <Popover.Button className="group relative rounded-full bg-brand-blue-3/30 p-2.5 text-brand-blue-1 hover:bg-brand-blue-1 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-2 focus:ring-offset-2">
                  <UserPlusIcon className="h-5 w-5" />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-1"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-1"
                >
                  <Popover.Panel className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 focus:outline-none z-50">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      Add Friend
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Username or #code"
                        className="h-9 text-sm border-gray-200 focus-visible:ring-brand-blue-2"
                      />
                      <Button
                        size="sm"
                        className="h-9 bg-brand-blue-1 hover:bg-brand-blue-2 text-white"
                      >
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Enter a username or unique code to find friends.
                    </p>
                  </Popover.Panel>
                </Transition>
              </Popover>

              {/* Friends Dropdown with Tabs */}
              <Menu as="div" className="relative">
                <Menu.Button className="rounded-full bg-brand-blue-3/30 p-2.5 text-brand-blue-1 hover:bg-brand-blue-1 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-2 focus:ring-offset-2">
                  <UsersIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-1"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-1"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-72 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden z-50">
                    <Tab.Group>
                      <Tab.List className="flex border-b border-gray-100 bg-gray-50/50">
                        <Tab
                          className={({ selected }) =>
                            cn(
                              "w-full py-2.5 text-sm font-medium leading-5 focus:outline-none transition-colors",
                              selected
                                ? "bg-white text-brand-blue-1 border-b-2 border-brand-blue-1"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            )
                          }
                        >
                          Friends
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            cn(
                              "w-full py-2.5 text-sm font-medium leading-5 focus:outline-none transition-colors",
                              selected
                                ? "bg-white text-brand-blue-1 border-b-2 border-brand-blue-1"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            )
                          }
                        >
                          Requests
                          {friendRequests.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-2 h-5 px-1.5 text-[10px] bg-brand-blue-3 text-brand-blue-1"
                            >
                              {friendRequests.length}
                            </Badge>
                          )}
                        </Tab>
                      </Tab.List>
                      <Tab.Panels>
                        <Tab.Panel className="p-1">
                          {friends.map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                            >
                              <div className="relative">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-1 text-xs font-bold text-white shadow-sm">
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
                              <span className="text-sm font-medium text-gray-700">
                                {friend.name}
                              </span>
                            </div>
                          ))}
                        </Tab.Panel>
                        <Tab.Panel className="p-1">
                          {friendRequests.length === 0 ? (
                            <div className="py-4 text-center text-sm text-gray-500">
                              No new requests
                            </div>
                          ) : (
                            friendRequests.map((request) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                                    {request.avatar}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {request.name}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 bg-brand-blue-1 hover:bg-brand-blue-2 text-white text-xs"
                                  >
                                    Accept
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Notifications Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="relative rounded-full bg-brand-blue-3/30 p-2.5 text-brand-blue-1 hover:bg-brand-blue-1 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-2 focus:ring-offset-2">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-brand-yellow-3 ring-2 ring-white" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-1"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-1"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Notifications
                      </span>
                      <span className="text-xs text-brand-blue-1 cursor-pointer hover:underline">
                        Mark all read
                      </span>
                    </div>
                    {notifications.map((notif) => (
                      <Menu.Item key={notif.id}>
                        {({ active }) => (
                          <div
                            className={cn(
                              "px-4 py-3 border-b border-gray-50 last:border-0 transition-colors cursor-pointer",
                              active ? "bg-brand-blue-3/10" : "",
                              notif.unread ? "bg-brand-blue-3/5" : ""
                            )}
                          >
                            <p className="text-sm text-gray-700">
                              {notif.text}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {notif.time}
                            </p>
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {/* Languages */}
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                  Known
                </span>
                <div className="relative rounded-full p-0.5 ring-2 ring-gray-100 group-hover:ring-brand-blue-2 transition-all">
                  <FlagUKSVG />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <span className="text-[10px] font-bold text-brand-blue-1 uppercase tracking-wider group-hover:text-brand-blue-2 transition-colors">
                  Learning
                </span>
                <div className="relative rounded-full p-0.5 ring-2 ring-brand-yellow-2 shadow-sm group-hover:ring-brand-yellow-3 transition-all scale-110">
                  <FlagSpainSVG />
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {/* User Button */}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    "w-9 h-9 border-2 border-white shadow-sm hover:border-brand-blue-2 transition-all",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-4">
              <Link to="/sign-in">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-brand-blue-1 hover:bg-brand-blue-3/10 font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button className="bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-bold rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </SignedOut>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-brand-blue-3 hover:text-brand-blue-1 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <Transition show={isMobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 md:hidden"
          onClose={setIsMobileMenuOpen}
        >
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
              <Dialog.Panel className="relative w-full max-w-xs overflow-y-auto bg-white pb-12 shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <LogoSVG />
                    <span className="text-xl font-bold text-gray-900">
                      LangLearn
                    </span>
                  </div>
                  <button
                    type="button"
                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-brand-blue-3 hover:text-brand-blue-1 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-6 px-6">
                  <SignedIn>
                    <div className="space-y-8">
                      {/* Streaks Mobile */}
                      <button
                        onClick={() =>
                          setActiveMobileSection(
                            activeMobileSection === "streak" ? null : "streak"
                          )
                        }
                        className={cn(
                          "w-full flex items-center justify-between rounded-xl p-4 border shadow-sm transition-all",
                          activeMobileSection === "streak"
                            ? "bg-brand-yellow-1 border-brand-yellow-2 ring-2 ring-brand-yellow-2"
                            : "bg-white border-gray-100 hover:bg-gray-50"
                        )}
                      >
                        <span className="font-semibold text-gray-700">
                          Daily Streak
                        </span>
                        <div className="flex items-center gap-2">
                          <FireIcon className="h-6 w-6 text-brand-yellow-3" />
                          <span className="text-xl font-bold text-gray-800">
                            {streaks}
                          </span>
                        </div>
                      </button>

                      {/* Streak Expanded Content */}
                      {activeMobileSection === "streak" && (
                        <div className="animate-fade-in rounded-xl bg-brand-yellow-1/30 p-4 text-center border border-brand-yellow-1">
                          <p className="text-sm text-gray-700 mb-3">
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
                            setActiveMobileSection(
                              activeMobileSection === "add" ? null : "add"
                            )
                          }
                          className={cn(
                            "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                            activeMobileSection === "add"
                              ? "bg-brand-blue-3/20 border-brand-blue-2 ring-1 ring-brand-blue-2"
                              : "border-gray-100 hover:bg-brand-blue-3/10 hover:border-brand-blue-3"
                          )}
                        >
                          <div className="rounded-full bg-brand-blue-3/50 p-2 text-brand-blue-1">
                            <UserPlusIcon className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            Add
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            setActiveMobileSection(
                              activeMobileSection === "friends"
                                ? null
                                : "friends"
                            )
                          }
                          className={cn(
                            "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                            activeMobileSection === "friends"
                              ? "bg-brand-blue-3/20 border-brand-blue-2 ring-1 ring-brand-blue-2"
                              : "border-gray-100 hover:bg-brand-blue-3/10 hover:border-brand-blue-3"
                          )}
                        >
                          <div className="rounded-full bg-brand-blue-3/50 p-2 text-brand-blue-1">
                            <UsersIcon className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            Friends
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            setActiveMobileSection(
                              activeMobileSection === "alerts" ? null : "alerts"
                            )
                          }
                          className={cn(
                            "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                            activeMobileSection === "alerts"
                              ? "bg-brand-blue-3/20 border-brand-blue-2 ring-1 ring-brand-blue-2"
                              : "border-gray-100 hover:bg-brand-blue-3/10 hover:border-brand-blue-3"
                          )}
                        >
                          <div className="rounded-full bg-brand-blue-3/50 p-2 text-brand-blue-1">
                            <BellIcon className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            Alerts
                          </span>
                        </button>
                      </div>

                      {/* Mobile Action Panels */}
                      <div className="space-y-4">
                        {/* Add Friend Panel */}
                        {activeMobileSection === "add" && (
                          <div className="animate-fade-in rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <h3 className="mb-3 text-sm font-bold text-gray-900">
                              Find Friend
                            </h3>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Username"
                                className="h-10 text-sm"
                              />
                              <Button className="h-10 bg-brand-blue-1 text-white">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Friends List Panel */}
                        {activeMobileSection === "friends" && (
                          <div className="animate-fade-in rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <div className="flex border-b border-gray-100 bg-gray-50/50">
                              <div className="w-1/2 py-2 text-center text-sm font-bold text-brand-blue-1 border-b-2 border-brand-blue-1">
                                Friends
                              </div>
                              <div className="w-1/2 py-2 text-center text-sm font-medium text-gray-500">
                                Requests
                              </div>
                            </div>
                            <div className="p-2 space-y-1">
                              {friends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
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
                                  <span className="text-sm font-medium text-gray-700">
                                    {friend.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notifications Panel */}
                        {activeMobileSection === "alerts" && (
                          <div className="animate-fade-in rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                              <span className="text-xs font-bold text-gray-500 uppercase">
                                Recent
                              </span>
                              <span className="text-xs text-brand-blue-1 font-medium">
                                Clear all
                              </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                              {notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  className={cn(
                                    "px-4 py-3",
                                    notif.unread ? "bg-brand-blue-3/5" : ""
                                  )}
                                >
                                  <p className="text-sm text-gray-700">
                                    {notif.text}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    {notif.time}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Languages Mobile */}
                      <div className="space-y-4 border-t border-gray-100 pt-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Languages
                        </h3>
                        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
                          <span className="text-sm font-medium text-gray-600">
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

                      <div className="py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-medium text-gray-700">
                          Account
                        </span>
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </div>
                  </SignedIn>

                  <SignedOut>
                    <div className="flex flex-col space-y-4">
                      <Link
                        to="/sign-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-center"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link
                        to="/sign-up"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
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
      </Transition>
    </nav>
  );
}
