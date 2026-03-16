"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

interface SubTab {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface Tab {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  subTabs?: SubTab[];
}

interface PageTabsProps {
  tabs: Tab[];
  basePath: string;
  defaultTab: string;
  defaultSubTab?: string;
  children?: React.ReactNode;
}

export default function PageTabs({ tabs, basePath, defaultTab, defaultSubTab }: PageTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const pathParts = pathname.replace(basePath, "").split("/").filter(Boolean);
  const activeTopTab = pathParts[0] || defaultTab;
  const activeSubTab = pathParts[1] || null;

  const activeTabConfig = tabs.find((t) => t.path === activeTopTab);

  useEffect(() => {
    if (pathname === basePath || pathname === `${basePath}/`) {
      const defaultPath = defaultSubTab
        ? `${basePath}/${defaultTab}/${defaultSubTab}`
        : `${basePath}/${defaultTab}`;
      router.replace(defaultPath);
    }
  }, [pathname, basePath, defaultTab, defaultSubTab, router]);

  useEffect(() => {
    if (activeTabConfig?.subTabs && !activeSubTab) {
      router.replace(`${basePath}/${activeTopTab}/${activeTabConfig.subTabs[0].path}`);
    }
  }, [activeTabConfig, activeSubTab, basePath, activeTopTab, router]);

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
            <Link
              key={tab.path}
              href={tabPath}
              className={`relative px-6 py-4 text-lg font-semibold transition-colors rounded-t-lg flex items-center justify-center gap-2
                ${isActive
                  ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-t-2 border-t-sky-500 border-l border-r border-gray-200 dark:border-slate-600 border-b-transparent -mb-px"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border border-transparent"
                }
              `}
            >
              {tab.icon && <tab.icon className="w-5 h-5" />}
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Sub-tabs */}
      {activeTabConfig?.subTabs && (
        <div className="flex gap-6 px-6 pt-4 pb-2 border-b border-gray-100 dark:border-slate-800">
          {activeTabConfig.subTabs.map((subTab) => {
            const isActive = activeSubTab === subTab.path;
            const subTabPath = `${basePath}/${activeTopTab}/${subTab.path}`;

            return (
              <Link
                key={subTab.path}
                href={subTabPath}
                className={`relative pb-3 text-sm font-medium transition-colors flex items-center gap-2
                  ${isActive
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  }
                `}
              >
                {subTab.icon && <subTab.icon className="w-4 h-4" />}
                {subTab.label}
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-sky-500 dark:bg-sky-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
