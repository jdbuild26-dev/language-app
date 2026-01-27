import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume2, Ear, PenTool, Mic, BookOpen } from "lucide-react";
import {
  PencilSquareIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState("ALL");

  const SECTIONS = [];

  // Helper validation to safely flatten activities
  const getAllActivities = () => {
    return SECTIONS.flatMap((section) =>
      section.activities.map((activity) => ({
        ...activity,
        category: section.title, // Add category for context if needed
        categoryId: section.id,
      })),
    );
  };

  const getFilteredActivities = () => {
    if (activeTab === "ALL") {
      return getAllActivities();
    }
    const section = SECTIONS.find((s) => s.id === activeTab);
    return section ? section.activities : [];
  };

  const TABS = [
    { id: "ALL", label: "ALL" },
    { id: "SPEAKING", label: "SPEAKING" },
    { id: "WRITING", label: "WRITING" },
    { id: "READING", label: "READING" },
    { id: "LISTENING", label: "LISTENING" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header - Mimicking the style provided */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-800 dark:text-gray-200 mb-6 uppercase tracking-wider text-opacity-80">
            Practice skills
          </h2>

          {/* Custom Tab Navigation */}
          <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-700">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-sm font-bold tracking-wide transition-all relative",
                  activeTab === tab.id
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {getFilteredActivities().length > 0 ? (
            getFilteredActivities().map((activity, idx) => (
              <div
                key={idx}
                className="group flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all items-center gap-4 relative overflow-hidden"
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center text-2xl shrink-0",
                    // Using a subtle background for the icon area to match the clean aesthetic
                    "bg-slate-50 dark:bg-slate-700/50",
                  )}
                >
                  {/* Adjusting icon rendering to handle both components and strings (emojis) consistently */}
                  <div
                    className={cn(
                      activity.iconIsComponent
                        ? "text-slate-700 dark:text-slate-300"
                        : "",
                    )}
                  >
                    {activity.icon}
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                    {activity.title}
                  </h3>

                  {/* Progress bar simulation or actual description */}
                  <div className="mt-2">
                    {/* We can reproduce the progress bar look from screenshot easily */}
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-200 dark:bg-gray-600 w-0" />{" "}
                      {/* 0% progress for now */}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-slate-400 font-medium hidden">
                        0/10
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay Link - Making the whole card clickable */}
                <Link
                  to={activity.path}
                  className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                  aria-label={`Start ${activity.title}`}
                />

                {/* Live Badge if applicable */}
                {activity.isLive && (
                  <div className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No practice activities yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                We're working on adding new practice exercises. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
