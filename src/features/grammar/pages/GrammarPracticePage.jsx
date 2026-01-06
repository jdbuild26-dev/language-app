import React from "react";
import { CheckCircle, Brain, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const practiceExercises = [
  {
    id: "quick-quiz",
    title: "Quick Quiz",
    description: "Rapid-fire grammar questions to test your knowledge",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200 dark:shadow-amber-900/20",
    path: "#",
  },
  {
    id: "fill-blanks",
    title: "Fill in the Blanks",
    description: "Complete sentences with the correct grammar forms",
    icon: Pen,
    color: "from-blue-400 to-cyan-500",
    shadow: "shadow-blue-200 dark:shadow-blue-900/20",
    path: "#",
  },
  {
    id: "sentence-builder",
    title: "Sentence Builder",
    description: "Arrange words to form correct sentences",
    icon: Brain,
    color: "from-purple-400 to-indigo-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
    path: "#",
  },
  {
    id: "mastery-test",
    title: "Mastery Test",
    description: "Comprehensive test covering all grammar topics",
    icon: Target,
    color: "from-red-400 to-rose-500",
    shadow: "shadow-red-200 dark:shadow-red-900/20",
    path: "#",
  },
];

// Placeholder for Pen icon since it was not imported in the original plan but used
import { PenTool as Pen } from "lucide-react";

export default function GrammarPracticePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Grammar Practice
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Exercises to Reinforce your grammar skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceExercises.map((exercise) => (
          <Link
            key={exercise.id}
            to={exercise.path}
            className="group relative block"
          >
            {/* Background Gradient & Shape */}
            <div
              className={cn(
                "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20",
                exercise.color
              )}
            />

            <div
              className={cn(
                "relative h-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-6 backdrop-blur-sm transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-xl",
                exercise.shadow
              )}
            >
              <div className="flex flex-col gap-4">
                {/* Icon Container */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                    exercise.color
                  )}
                >
                  <exercise.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {exercise.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {exercise.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
