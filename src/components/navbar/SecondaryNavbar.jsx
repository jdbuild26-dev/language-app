import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpenIcon,
  AcademicCapIcon,
  BookmarkIcon,
  PencilSquareIcon,
  NewspaperIcon,
  SparklesIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Vocabulary", path: "/vocabulary", icon: BookOpenIcon },
  { name: "Grammar", path: "/grammar", icon: AcademicCapIcon },
  { name: "Stories", path: "/stories", icon: BookmarkIcon },
  { name: "Practice", path: "/practice", icon: PencilSquareIcon },
  { name: "Blogs", path: "/blogs", icon: NewspaperIcon },
  { name: "AI Practice", path: "/ai-practice", icon: SparklesIcon },
  { name: "Progress Report", path: "/progress-report", icon: ChartBarIcon },
];

export default function SecondaryNavbar() {
  const location = useLocation();
  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Find active item index
  const activeIndex = navItems.findIndex(
    (item) => location.pathname === item.path
  );

  // Initialize pill position on active item
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex];
      setPillStyle({
        left: activeItem.offsetLeft,
        width: activeItem.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeIndex]);

  const handleMouseEnter = (index) => {
    const item = itemRefs.current[index];
    if (item) {
      setPillStyle({
        left: item.offsetLeft,
        width: item.offsetWidth,
        opacity: 1,
      });
    }
  };

  const handleMouseLeave = () => {
    // Return pill to active item or hide if no active item
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex];
      setPillStyle({
        left: activeItem.offsetLeft,
        width: activeItem.offsetWidth,
        opacity: 1,
      });
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <nav className="sticky top-[72px] z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-700 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div
          ref={navRef}
          className="relative hidden md:flex items-center h-14 gap-1"
          onMouseLeave={handleMouseLeave}
        >
          {/* Sliding Pill Background */}
          <div
            className="absolute h-10 bg-sky-100 dark:bg-sky-900/40 rounded-full transition-all duration-200 ease-out pointer-events-none"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />

          {/* Nav Items */}
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                ref={(el) => (itemRefs.current[index] = el)}
                onMouseEnter={() => handleMouseEnter(index)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150
                  ${
                    isActive
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between h-12">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
            {navItems.find((item) => item.path === location.pathname)?.name ||
              "Navigate"}
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 dark:border-slate-700">
            <div className="flex flex-col gap-1 pt-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400"
                          : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
