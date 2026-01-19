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

  const SECTIONS = [
    {
      id: "SPEAKING",
      title: "Speaking",
      description: "Practice pronunciation",
      activities: [
        {
          title: "Repeat Sentence",
          description: "Speak the missing word",
          path: "/vocabulary/practice/repeat-sentence",
          color: "bg-green-500",
          icon: <Mic className="w-6 h-6" />,
          iconIsComponent: true,
          level: "D1",
          isLive: true,
        },
      ],
    },
    {
      id: "LISTENING",
      title: "Listening",
      description: "Improve your comprehension",
      activities: [
        {
          title: "Match Pairs (Audio)",
          description: "Match sounds to text",
          path: "/vocabulary/practice/match-pairs-b1",
          color: "bg-purple-500",
          icon: "🎵",
          level: "B1",
          isLive: true,
        },
        {
          title: "Phonetics",
          description: "Distinguish similar sounds",
          path: "/vocabulary/practice/listening/phonetics",
          color: "bg-indigo-500",
          icon: "🔊",
          level: "B2",
          isLive: true,
        },
        {
          title: "Multiple Select",
          description: "Select all valid options",
          path: "/vocabulary/practice/listening/multi-select",
          color: "bg-pink-500",
          icon: "☑️",
          level: "A1",
          isLive: true,
        },
        {
          title: "Audio Match",
          description: "Match spoken audio",
          path: "/vocabulary/practice/listening/audio-match",
          color: "bg-violet-500",
          icon: "🎧",
          level: "B5",
          isLive: true,
        },
        {
          title: "Audio Fill in the Blank",
          description: "Listen and complete",
          path: "/vocabulary/practice/listening/fill-in-blank",
          icon: "🔉",
          color: "bg-teal-500",
          level: "B5",
          isLive: true,
        },
        {
          title: "Dictation",
          description: "Transcribe what you hear",
          path: "/vocabulary/practice/listening/dictation",
          color: "bg-yellow-500",
          icon: "⌨️",
          level: "B6",
          isLive: true,
        },
      ],
    },
    {
      id: "WRITING",
      title: "Writing",
      description: "Practice your written French",
      activities: [
        {
          title: "Fill in the Blank",
          description: "Complete sentences",
          path: "/vocabulary/practice/fill-in-blank",
          color: "bg-sky-500",
          icon: "📝",
          level: "C1",
          isLive: true,
        },
        {
          title: "Correct Spelling",
          description: "Fix spelling errors",
          path: "/vocabulary/practice/correct-spelling",
          color: "bg-red-500",
          icon: "✍️",
          level: "C2",
          isLive: true,
        },
      ],
    },
    {
      id: "READING",
      title: "Reading",
      description: "Expand your word bank",
      activities: [
        {
          title: "Match Pairs (A1)",
          description: "Match words to translations",
          path: "/vocabulary/practice/match-pairs",
          color: "bg-blue-500",
          icon: "🧩",
          level: "A1",
          isLive: true,
        },
        {
          title: "Odd One Out",
          description: "Identify the intruder",
          path: "/vocabulary/practice/odd-one-out",
          color: "bg-orange-500",
          icon: "❓",
          level: "A1",
          isLive: true,
        },
        {
          title: "Group Words",
          description: "Categorize words",
          path: "/vocabulary/practice/group-words",
          color: "bg-green-500",
          icon: "📂",
          level: "A1",
          isLive: true,
        },
      ],
    },
  ];

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
          {getFilteredActivities().map((activity, idx) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
