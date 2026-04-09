import { Fragment, useState } from "react";
import { Menu, Transition, Popover, Tab } from "@headlessui/react";
import {
  BellIcon,
  UserPlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function ProfilePreviewModal({ request, onClose, onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-sm ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
        {/* Header banner */}
        <div className="h-20 bg-gradient-to-r from-brand-blue-1 to-indigo-500" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-10 mb-3 flex items-end justify-between">
            <div className="h-20 w-20 rounded-2xl bg-brand-blue-1 flex items-center justify-center text-white text-3xl font-black shadow-lg border-4 border-white dark:border-card-dark">
              {(request.name || request.username || "?")[0].toUpperCase()}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Name & username */}
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            {request.name || "User"}
          </h2>
          {request.username && (
            <p className="text-sm text-brand-blue-1 font-semibold mb-4">
              @{request.username}
            </p>
          )}

          {/* Language info */}
          <div className="space-y-2 mb-5">
            {request.primaryLanguage && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Learning</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {request.primaryLanguage}
                  {request.level ? ` · ${request.level}` : ""}
                </span>
              </div>
            )}
            {request.translationLanguage && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Knows</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {request.translationLanguage}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-bold"
              onClick={() => { onAccept(request.id); onClose(); }}
            >
              <CheckIcon className="h-4 w-4 mr-1" /> Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
              onClick={() => { onDecline(request.id); onClose(); }}
            >
              <XMarkIcon className="h-4 w-4 mr-1" /> Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActionsGroup({
  friends,
  friendRequests,
  onRespondToRequest,
}) {
  const [previewRequest, setPreviewRequest] = useState(null);

  // Build real notifications from friend requests
  const notifications = friendRequests.map((r) => ({
    id: r.id,
    text: `${r.name || r.username || "Someone"} sent you a friend request`,
    time: "Just now",
    unread: true,
  }));

  return (
    <>
      {previewRequest && (
        <ProfilePreviewModal
          request={previewRequest}
          onClose={() => setPreviewRequest(null)}
          onAccept={(id) => onRespondToRequest?.(id, "active")}
          onDecline={(id) => onRespondToRequest?.(id, "rejected")}
        />
      )}

      <div className="flex items-center gap-3">
        {/* Add Friend Popover */}
        <Popover className="relative">
          <Popover.Button className="group relative rounded-full p-2 text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
            <UserPlusIcon className="h-[22px] w-[22px]" strokeWidth={1.5} />
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
            <Popover.Panel className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl bg-white dark:bg-card-dark p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50">
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Add Friend
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Username or #code"
                  className="h-9 text-sm border-gray-200 dark:border-subtle-dark bg-transparent dark:text-primary-dark focus-visible:ring-brand-blue-2"
                />
                <Button size="sm" className="h-9 bg-brand-blue-1 hover:bg-brand-blue-2 text-white">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Enter a username to find friends. Or go to{" "}
                <a href="/dashboard/friends" className="text-brand-blue-1 hover:underline">Friends page</a>.
              </p>
            </Popover.Panel>
          </Transition>
        </Popover>

        {/* Friends Dropdown with Tabs */}
        <Menu as="div" className="relative">
          <Menu.Button className="group relative rounded-full p-2 text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
            <UsersIcon className="h-[22px] w-[22px]" strokeWidth={1.5} />
            {friendRequests.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-transparent" />
            )}
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
            <Menu.Items className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl bg-white dark:bg-card-dark shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden z-50">
              <Tab.Group>
                <Tab.List className="flex border-b border-gray-100 dark:border-subtle-dark bg-gray-50/50 dark:bg-elevated-2/50">
                  <Tab className={({ selected }) => cn(
                    "w-full py-2.5 text-sm font-medium leading-5 focus:outline-none transition-colors",
                    selected
                      ? "bg-white dark:bg-card-dark text-brand-blue-1 dark:text-sky-400 border-b-2 border-brand-blue-1 dark:border-sky-400"
                      : "text-gray-500 dark:text-secondary-dark hover:text-gray-700 dark:hover:text-primary-dark hover:bg-gray-50 dark:hover:bg-elevated-2"
                  )}>
                    Friends
                  </Tab>
                  <Tab className={({ selected }) => cn(
                    "w-full py-2.5 text-sm font-medium leading-5 focus:outline-none transition-colors",
                    selected
                      ? "bg-white dark:bg-card-dark text-brand-blue-1 dark:text-sky-400 border-b-2 border-brand-blue-1 dark:border-sky-400"
                      : "text-gray-500 dark:text-secondary-dark hover:text-gray-700 dark:hover:text-primary-dark hover:bg-gray-50 dark:hover:bg-elevated-2"
                  )}>
                    Requests
                    {friendRequests.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-brand-blue-3 text-brand-blue-1">
                        {friendRequests.length}
                      </Badge>
                    )}
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  {/* Friends tab */}
                  <Tab.Panel className="p-1 max-h-64 overflow-y-auto">
                    {friends.length === 0 ? (
                      <div className="py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                        No friends yet
                      </div>
                    ) : (
                      friends.map((friend) => (
                        <div key={friend.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-1 text-xs font-bold text-white shadow-sm">
                            {(friend.name || friend.username || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                              {friend.name || friend.username}
                            </p>
                            {friend.username && (
                              <p className="text-xs text-gray-400 dark:text-slate-500">@{friend.username}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </Tab.Panel>

                  {/* Requests tab */}
                  <Tab.Panel className="p-1 max-h-64 overflow-y-auto">
                    {friendRequests.length === 0 ? (
                      <div className="py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                        No new requests
                      </div>
                    ) : (
                      friendRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          onClick={() => setPreviewRequest(request)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue-1 to-indigo-500 text-xs font-bold text-white shadow-sm">
                              {(request.name || request.username || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                                {request.name || request.username || "User"}
                              </p>
                              {request.primaryLanguage && (
                                <p className="text-xs text-gray-400 dark:text-slate-500">
                                  Learning {request.primaryLanguage}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              className="h-7 w-7 p-0 bg-green-500/20 text-green-600 hover:bg-green-500 hover:text-white rounded-lg border border-green-500/30"
                              onClick={() => onRespondToRequest?.(request.id, "active")}
                            >
                              <CheckIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              onClick={() => onRespondToRequest?.(request.id, "rejected")}
                            >
                              <XMarkIcon className="h-3.5 w-3.5" />
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
          <Menu.Button className="group relative rounded-full p-2 text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
            <BellIcon className="h-[22px] w-[22px]" strokeWidth={1.5} />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-brand-yellow-3 ring-2 ring-transparent" />
            )}
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
            <Menu.Items className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl bg-white dark:bg-card-dark py-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 dark:border-subtle-dark">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Notifications
                </span>
              </div>
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <Menu.Item key={notif.id}>
                    {({ active }) => (
                      <div className={cn(
                        "px-4 py-3 border-b border-gray-50 dark:border-subtle-dark last:border-0 transition-colors cursor-pointer",
                        active ? "bg-brand-blue-3/10" : "",
                        notif.unread ? "bg-brand-blue-3/5" : ""
                      )}>
                        <p className="text-sm text-gray-700 dark:text-slate-200">{notif.text}</p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-400">{notif.time}</p>
                      </div>
                    )}
                  </Menu.Item>
                ))
              )}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  );
}
