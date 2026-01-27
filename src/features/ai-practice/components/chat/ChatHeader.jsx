import { ArrowLeft, User, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Level badge colors
const levelColors = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  A2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  B1: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  B2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  C1: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  C2: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function ChatHeader({ scenario, onEndSession }) {
  const levelColor = levelColors[scenario.level] || levelColors.A1;

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* Top row: Back button + Level + Formality */}
        <div className="flex items-center justify-between mb-2">
          <Link
            to="/ai-practice/scenarios/chats"
            className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Level Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${levelColor}`}
            >
              {scenario.level}
            </span>

            {/* Formality Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${scenario.formality === "formal"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                }`}
            >
              {scenario.formality === "formal" ? "Formal" : "Casual"}
            </span>
          </div>

          <button
            onClick={onEndSession}
            className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            End Session
          </button>
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {scenario.title}
        </h1>

        {/* Objective */}
        {scenario.objective && (
          <p className="text-sm text-gray-500 dark:text-slate-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-500" />
            <span>{scenario.objective}</span>
          </p>
        )}
      </div>
    </div>
  );
}
