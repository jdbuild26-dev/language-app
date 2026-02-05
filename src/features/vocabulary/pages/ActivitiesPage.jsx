import React from "react";
import {
  Layers,
  Puzzle,
  Keyboard,
  HelpCircle,
  Hash,
  Clock,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Master vocabulary with interactive flashcards",
    icon: Layers,
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-200 dark:shadow-cyan-900/20",
    path: "/vocabulary/lessons/activities/flashcards",
  },
  {
    id: "match-words",
    title: "Match Words",
    description: "Match English words to French",
    icon: Puzzle,
    color: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-200 dark:shadow-orange-900/20",
    path: "/vocabulary/lessons/activities/match-words",
  },
  {
    id: "match-images",
    title: "Match Images",
    description: "Match images to French words",
    icon: ImageIcon,
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-200 dark:shadow-pink-900/20",
    path: "/vocabulary/lessons/activities/match-images",
  },
  {
    id: "spelling",
    title: "Spelling Practice",
    description: "Improve your spelling accuracy",
    icon: Keyboard,
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
    path: "#",
  },
  {
    id: "gender",
    title: "Gender Identifier",
    description: "Practice masculine and feminine forms",
    icon: HelpCircle,
    color: "from-yellow-400 to-amber-500",
    shadow: "shadow-yellow-200 dark:shadow-yellow-900/20",
    path: "#",
  },
  {
    id: "numbers",
    title: "Number Practice",
    description: "Learn to count and use numbers",
    icon: Hash,
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200 dark:shadow-rose-900/20",
    path: "#",
  },
  {
    id: "clock",
    title: "Clock Practice",
    description: "Tell time in French",
    icon: Clock,
    color: "from-sky-400 to-indigo-500",
    shadow: "shadow-sky-200 dark:shadow-sky-900/20",
    path: "#",
  },
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Learning Activities
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Engage with interactive games to boost your French skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            to={activity.path}
            className="group relative block"
          >
            {/* Background Gradient & Shape */}
            <div
              className={cn(
                "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20",
                activity.color,
              )}
            />

            <div
              className={cn(
                "relative h-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-6 backdrop-blur-sm transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-xl",
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

              <div className="flex flex-col gap-4">
                {/* Icon Container */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                    activity.color,
                  )}
                >
                  <activity.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {activity.description}
                  </p>
                </div>

                {/* Arrow hint */}
                <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <Sparkles
                    className={cn("h-5 w-5 opacity-50", "text-slate-400")}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
