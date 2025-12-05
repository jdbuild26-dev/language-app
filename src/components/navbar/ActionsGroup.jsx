import { Fragment } from "react";
import { Menu, Transition, Popover, Tab } from "@headlessui/react";
import {
  BellIcon,
  UserPlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ActionsGroup({
  friends,
  friendRequests,
  notifications,
}) {
  return (
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
                    <p className="text-sm text-gray-700">{notif.text}</p>
                    <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                  </div>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
