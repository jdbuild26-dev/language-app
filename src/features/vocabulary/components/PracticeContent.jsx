import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Highlighter,
  MessageSquare,
  Mic,
  Music,
  Image as ImageIcon,
  Keyboard,
  ListTodo,
  Layers,
  Volume2,
  GitMerge,
  Sparkles,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tab configuration
const tabs = [
  { id: "all", label: "ALL" },
  { id: "speaking", label: "SPEAKING" },
  { id: "writing", label: "WRITING" },
  { id: "reading", label: "READING" },
  { id: "listening", label: "LISTENING" },
];

// Practice activities with category mapping
const practiceActivities = [
  // Reading (Vocabulary) Activities
  {
    id: "read-select",
    name: "Read and Select",
    icon: CheckCircle2,
    desc: "Choose the correct answer",
    path: "choose-options",
    category: "reading",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
  },

  {
    id: "highlight-word",
    name: "Highlight the Word",
    icon: Highlighter,
    desc: "Find the word in context",
    path: "highlight-word",
    category: "reading",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
  },
  {
    id: "odd-one-out",
    name: "Odd One Out",
    icon: ListTodo,
    desc: "Identify the unrelated word",
    path: "odd-one-out",
    category: "reading",
    color: "from-yellow-400 to-amber-500",
    shadow: "shadow-yellow-200 dark:shadow-yellow-900/20",
  },
  {
    id: "group-words",
    name: "Group Words",
    icon: GitMerge,
    desc: "Sort words into categories",
    path: "group-words",
    category: "reading",
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200 dark:shadow-rose-900/20",
  },

  // Listening Activities

  // Listening Activities
  // {
  //   id: "audio-match",
  //   name: "Match Pairs (Audio)",
  //   icon: Music,
  //   desc: "Match sounds to text",
  //   path: "listening/match-pairs",
  //   category: "listening",
  //   color: "from-purple-400 to-violet-500",
  //   shadow: "shadow-purple-200 dark:shadow-purple-900/20",
  // },
  {
    id: "phonetics",
    name: "Phonetics",
    icon: Volume2,
    desc: "Distinguish similar sounds",
    path: "listening/phonetics",
    category: "listening",
    color: "from-sky-400 to-indigo-500",
    shadow: "shadow-sky-200 dark:shadow-sky-900/20",
  },
  {
    id: "multi-select",
    name: "Multiple Select",
    icon: CheckCircle2,
    desc: "Select all valid options",
    path: "listening/multi-select",
    category: "listening",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
  },
  {
    id: "audio-match-2",
    name: "Audio Match",
    icon: Mic,
    desc: "Match spoken audio",
    path: "listening/audio-match",
    category: "listening",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
  },
  {
    id: "audio-fill-blank",
    name: "Audio Fill in the Blank",
    icon: Volume2,
    desc: "Listen and complete",
    path: "listening/fill-in-blank",
    category: "listening",
    color: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-200 dark:shadow-orange-900/20",
  },
  {
    id: "dictation",
    name: "Dictation",
    icon: Keyboard,
    desc: "Transcribe what you hear",
    path: "listening/dictation",
    category: "listening",
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200 dark:shadow-rose-900/20",
  },
  {
    id: "listen-fill-blanks",
    name: "Listen and Fill Blanks",
    icon: Edit3,
    desc: "Fill in missing words from audio",
    path: "/vocabulary/practice/listening/fill-blanks",
    category: "listening",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
  },

  // Writing Activities
  {
    id: "fill-blank",
    name: "Fill in the Blank",
    icon: Keyboard,
    desc: "Complete the sentence",
    path: "fill-in-blank",
    category: "writing",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
  },
  {
    id: "correct-spelling",
    name: "Correct Spelling",
    icon: CheckCircle2,
    desc: "Fix misspelled words",
    path: "correct-spelling",
    category: "writing",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
  },
  {
    id: "dictation-image",
    name: "Dictation (Image)",
    icon: ImageIcon,
    desc: "Name the object displayed",
    path: "dictation-image",
    category: "writing",
    color: "from-purple-400 to-violet-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
  },
  {
    id: "is-french-word",
    name: "Is this a French Word?",
    icon: CheckCircle2,
    desc: "Identify real French words",
    path: "is-french-word",
    category: "writing",
    color: "from-teal-400 to-cyan-500",
    shadow: "shadow-teal-200 dark:shadow-teal-900/20",
  },

  // Speaking Activities
  {
    id: "repeat-word",
    name: "Repeat Word",
    icon: Volume2,
    desc: "Speak the missing word",
    path: "repeat-word",
    category: "speaking",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
  },
  {
    id: "repeat-sentence",
    name: "Repeat Sentence",
    icon: Mic,
    desc: "Repeat the full sentence",
    path: "repeat-sentence",
    category: "speaking",
    color: "from-purple-400 to-violet-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
  },
  {
    id: "what-do-you-see",
    name: "What do you see?",
    icon: MessageSquare,
    desc: "Describe the image",
    path: "what-do-you-see",
    category: "speaking",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
  },
];

export default function PracticeContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const handleCardClick = (activity) => {
    if (activity.path) {
      navigate(activity.path);
    }
  };

  // Filter activities based on active tab
  const filteredActivities =
    activeTab === "all"
      ? practiceActivities
      : practiceActivities.filter(
        (activity) => activity.category === activeTab,
      );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Practice skills
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-semibold tracking-wide transition-colors relative",
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300",
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => handleCardClick(activity)}
            className="group relative block cursor-pointer"
          >
            {/* Background Gradient & Shape */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20",
                activity.color,
              )}
            />

            <div
              className={cn(
                "relative h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-lg",
                activity.shadow,
              )}
            >
              {/* Decorative Circle */}
              <div
                className={cn(
                  "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30",
                  activity.color,
                )}
              />

              <div className="flex items-center gap-4">
                {/* Icon Container */}
                <div
                  className={cn(
                    "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                    activity.color,
                  )}
                >
                  <activity.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5">
                    {activity.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                    {activity.desc}
                  </p>
                </div>

                {/* Progress Bar Placeholder */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-1">
                    0/6
                  </p>
                </div>

                {/* Arrow hint */}
                <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <Sparkles className="h-4 w-4 text-slate-400 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No activities available for this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
