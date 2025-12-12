import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { FireIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export default function StreaksDropdown({ streaks }) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
        <FireIcon className="h-5 w-5 text-brand-yellow-2 drop-shadow-sm" />
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
        <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right rounded-xl bg-white dark:bg-card-dark p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow-1 dark:bg-yellow-900/30 mb-3">
              <FireIcon className="h-8 w-8 text-brand-yellow-3 dark:text-yellow-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-secondary-dark">
              You have maintained a streak for{" "}
              <span className="font-bold text-gray-900 dark:text-primary-dark">
                {streaks} days
              </span>
              !
            </p>
            <Button
              size="sm"
              className="mt-3 w-full bg-brand-yellow-2 text-gray-900 hover:bg-brand-yellow-3 border-none dark:bg-yellow-500 dark:hover:bg-yellow-400"
            >
              Keep it up!
            </Button>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
