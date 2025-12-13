import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

/**
 * Reusable PageTabs component for top-level tabs with optional sub-tabs.
 *
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects: { label, path, subTabs?: [{ label, path }] }
 * @param {string} props.basePath - Base URL path (e.g., "/vocabulary")
 * @param {string} props.defaultTab - Default tab path to redirect to (e.g., "lessons")
 * @param {string} props.defaultSubTab - Default sub-tab path (e.g., "learn")
 *
 * @example
 * <PageTabs
 *   basePath="/vocabulary"
 *   defaultTab="lessons"
 *   defaultSubTab="learn"
 *   tabs={[
 *     { label: "Lessons", path: "lessons", subTabs: [
 *       { label: "Learn", path: "learn" },
 *       { label: "Review", path: "review" },
 *     ]},
 *     { label: "Practice", path: "practice" },
 *   ]}
 * />
 */
export default function PageTabs({
  tabs,
  basePath,
  defaultTab,
  defaultSubTab,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current paths from URL
  const pathParts = location.pathname
    .replace(basePath, "")
    .split("/")
    .filter(Boolean);
  const activeTopTab = pathParts[0] || defaultTab;
  const activeSubTab = pathParts[1] || null;

  // Find active tab config
  const activeTabConfig = tabs.find((t) => t.path === activeTopTab);

  // Redirect to default tab if on base path
  useEffect(() => {
    if (
      location.pathname === basePath ||
      location.pathname === `${basePath}/`
    ) {
      const defaultPath = defaultSubTab
        ? `${basePath}/${defaultTab}/${defaultSubTab}`
        : `${basePath}/${defaultTab}`;
      navigate(defaultPath, { replace: true });
    }
  }, [location.pathname, basePath, defaultTab, defaultSubTab, navigate]);

  // Redirect to default sub-tab if tab has sub-tabs but none selected
  useEffect(() => {
    if (activeTabConfig?.subTabs && !activeSubTab) {
      navigate(
        `${basePath}/${activeTopTab}/${activeTabConfig.subTabs[0].path}`,
        { replace: true }
      );
    }
  }, [activeTabConfig, activeSubTab, basePath, activeTopTab, navigate]);

  return (
    <div className="w-full">
      {/* Top-level tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const isActive = activeTopTab === tab.path;
          const tabPath = tab.subTabs
            ? `${basePath}/${tab.path}/${tab.subTabs[0].path}`
            : `${basePath}/${tab.path}`;

          return (
            <NavLink
              key={tab.path}
              to={tabPath}
              className={`relative px-6 py-4 text-lg font-semibold transition-colors rounded-t-lg flex items-center justify-center gap-2
                ${
                  isActive
                    ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-t-2 border-t-sky-500 border-l border-r border-gray-200 dark:border-slate-600 border-b-transparent -mb-px"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border border-transparent"
                }
              `}
            >
              {tab.icon && <tab.icon className="w-5 h-5" />}
              {tab.label}
            </NavLink>
          );
        })}
      </div>

      {/* Sub-tabs (if active tab has them) */}
      {activeTabConfig?.subTabs && (
        <div className="flex gap-6 px-6 pt-4 pb-2 border-b border-gray-100 dark:border-slate-800">
          {activeTabConfig.subTabs.map((subTab) => {
            const isActive = activeSubTab === subTab.path;
            const subTabPath = `${basePath}/${activeTopTab}/${subTab.path}`;

            return (
              <NavLink
                key={subTab.path}
                to={subTabPath}
                className={`relative pb-3 text-sm font-medium transition-colors flex items-center gap-2
                  ${
                    isActive
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  }
                `}
              >
                {subTab.icon && <subTab.icon className="w-4 h-4" />}
                {subTab.label}
                {/* Blue underline for active sub-tab */}
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-sky-500 dark:bg-sky-400 rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Content outlet */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
