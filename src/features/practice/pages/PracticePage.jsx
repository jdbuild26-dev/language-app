import {
  PencilSquareIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume2, Ear, PenTool, Mic } from "lucide-react";

export default function PracticePage() {
  const SECTIONS = [
    {
      title: "Speaking",
      description: "Practice pronunciation",
      icon: <Mic className="w-6 h-6 text-green-600 dark:text-green-400" />,
      color: "bg-green-100 dark:bg-green-900/40",
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
      title: "Listening",
      description: "Improve your comprehension",
      icon: <Ear className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      color: "bg-purple-100 dark:bg-purple-900/40",
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
          path: "/vocabulary/practice/listening/audio-match", // Reusing AudioToAudioPage as likely intent
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
      title: "Writing",
      description: "Practice your written French",
      icon: (
        <PencilSquareIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
      ),
      color: "bg-orange-100 dark:bg-orange-900/40",
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
      title: "Reading",
      description: "Expand your word bank",
      icon: (
        <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      ),
      color: "bg-blue-100 dark:bg-blue-900/40",
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Practice Area
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Master your skills with interactive exercises designed for every
            level.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
              {/* Icon wrapper */}
              <div className={cn("p-3 rounded-2xl", section.color)}>
                {section.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {section.description}
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.activities.map((activity, aIdx) => (
                <Link
                  key={aIdx}
                  to={activity.path}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                >
                  {/* LIVE badge */}
                  {activity.isLive && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-200">
                      Live
                    </span>
                  )}

                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm",
                        activity.color,
                        activity.iconIsComponent
                          ? "text-white"
                          : "bg-opacity-10 text-opacity-100"
                        // If icon is component (like Speaker) and we gave it a solid BG color class, text should be white.
                        // If emoji, we usually use bg-opacity.
                        // Quick fix for the mixed types:
                      )}
                    >
                      {activity.icon}
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                      {activity.title}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
