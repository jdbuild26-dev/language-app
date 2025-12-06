import { useState } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { LogoSVG } from "./navbar/NavbarIcons";
import {
  streaks,
  friends,
  friendRequests,
  notifications,
} from "./navbar/navbar-data";
import StreaksDropdown from "./navbar/StreaksDropdown";
import ActionsGroup from "./navbar/ActionsGroup";
import LanguageSelector from "./navbar/LanguageSelector";
import MobileMenu from "./navbar/MobileMenu";
import { DarkModeToggle } from "./navbar/DarkModeToggle";

export default function LangLearnNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState(null);

  return (
    <nav className="sticky top-0 z-50 h-[72px] w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm dark:shadow-slate-950 border-b border-gray-100 dark:border-slate-700 transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Brand */}
        <Link to="/" className="flex items-center gap-3.5">
          <LogoSVG />
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            LangLearn
          </span>
        </Link>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex md:items-center md:gap-5">
          <DarkModeToggle />
          <SignedIn>
            <StreaksDropdown streaks={streaks} />

            <div className="h-6 w-px bg-gray-200 dark:bg-slate-600" />

            <ActionsGroup
              friends={friends}
              friendRequests={friendRequests}
              notifications={notifications}
            />

            <div className="h-6 w-px bg-gray-200 dark:bg-slate-600" />

            <LanguageSelector />

            <div className="h-6 w-px bg-gray-200 dark:bg-slate-600" />

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
                  className="text-gray-600 dark:text-slate-300 hover:text-brand-blue-1 hover:bg-brand-blue-3/10 font-medium"
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

        {/* Mobile Menu Button + Dark Mode Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <DarkModeToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 dark:text-slate-300 hover:bg-brand-blue-3 dark:hover:bg-slate-700 hover:text-brand-blue-1 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        activeSection={activeMobileSection}
        setActiveSection={setActiveMobileSection}
        streaks={streaks}
        friends={friends}
        notifications={notifications}
      />
    </nav>
  );
}
