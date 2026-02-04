import React from "react";
import {
  CheckCircle,
  Brain,
  Zap,
  Target,
  PenTool as Pen,
  Sparkles,
  Type,
  HelpCircle,
  LayoutGrid,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const practiceExercises = [
  {
    id: "fill-blanks-options",
    title: "Fill in the Blanks",
    description: "Choose from options to fill in the blanks",
    icon: Pen,
    color: "from-blue-400 to-cyan-500",
    shadow: "shadow-blue-200 dark:shadow-blue-900/20",
    path: "/grammar/practice/fill-blanks-options",
    isLive: true,
  },
  {
    id: "four-options",
    title: "Choose from 4 Options",
    description: "Select the correct answer from 4 choices",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200 dark:shadow-amber-900/20",
    path: "/grammar/practice/four-options",
    isLive: true,
  },
  {
    id: "two-options",
    title: "Choose from 2 Options",
    description: "Pick the right answer from 2 possibilities",
    icon: CheckCircle,
    color: "from-purple-400 to-indigo-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
    path: "/grammar/practice/two-options",
    isLive: true,
  },
  {
    id: "three-options",
    title: "Choose from 3 Options",
    description: "Select the correct option from 3 choices",
    icon: Target,
    color: "from-red-400 to-rose-500",
    shadow: "shadow-red-200 dark:shadow-red-900/20",
    path: "/grammar/practice/three-options",
    isLive: true,
  },
  {
    id: "fill-blanks",
    title: "Fill in Blanks (Input)",
    description: "Type the missing words with hints",
    icon: Type,
    color: "from-indigo-400 to-violet-500",
    shadow: "shadow-indigo-200 dark:shadow-indigo-900/20",
    path: "/grammar/practice/fill-blanks",
    isLive: true,
  },
  {
    id: "fill-blanks-question",
    title: "Fill in Blanks (Question)",
    description: "Answer questions by filling blanks",
    icon: HelpCircle,
    color: "from-fuchsia-400 to-pink-500",
    shadow: "shadow-fuchsia-200 dark:shadow-fuchsia-900/20",
    path: "/grammar/practice/fill-blanks-question",
    isLive: true,
  },
  {
    id: "reorder-words",
    title: "Reorder Words",
    description: "Build sentences by reordering words",
    icon: LayoutGrid,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200 dark:shadow-amber-900/20",
    path: "/grammar/practice/reorder-words",
    isLive: true,
  },
];

export default function GrammarPracticePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Grammar Practice
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practiceExercises.map((exercise) => (
            <Link
              key={exercise.id}
              to={exercise.path}
              className="group relative block cursor-pointer"
            >
              {/* Background Gradient & Shape */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20",
                  exercise.color,
                )}
              />

              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-5 backdrop-blur-sm transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-lg",
                  exercise.shadow,
                )}
              >
                {/* Decorative Circle */}
                <div
                  className={cn(
                    "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30",
                    exercise.color,
                  )}
                />

                <div className="flex items-center gap-4">
                  {/* Icon Container */}
                  <div
                    className={cn(
                      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                      exercise.color,
                    )}
                  >
                    <exercise.icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5">
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                      {exercise.description}
                    </p>
                  </div>

                  {/* Progress Bar (Mock) */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-1">
                      0/6
                    </p>
                  </div>

                  {/* Sparkle hint on hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <Sparkles className="h-4 w-4 text-slate-400 opacity-50" />
                  </div>

                  {/* Live Badge */}
                  {exercise.isLive && (
                    <div className="absolute top-3 right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
