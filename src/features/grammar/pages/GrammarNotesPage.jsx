import React from "react";
import { Book, Type, MessageSquare, PenTool } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const notesTopics = [
  {
    id: "nouns-articles",
    title: "Nouns & Articles",
    description:
      "Learn about gender, plural forms, and definite/indefinite articles",
    icon: Book,
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-200 dark:shadow-blue-900/20",
    path: "#",
  },
  {
    id: "adjectives",
    title: "Adjectives",
    description: "Understanding adjective agreement and placement",
    icon: Type,
    color: "from-purple-400 to-pink-500",
    shadow: "shadow-purple-200 dark:shadow-purple-900/20",
    path: "#",
  },
  {
    id: "verbs-tenses",
    title: "Verbs & Tenses",
    description: "Master conjugations for Present, Past, and Future tenses",
    icon: PenTool,
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
    path: "#",
  },
  {
    id: "sentence-structure",
    title: "Sentence Structure",
    description: "Learn how to build correct French sentences",
    icon: MessageSquare,
    color: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-200 dark:shadow-orange-900/20",
    path: "#",
  },
];

export default function GrammarNotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Grammar Notes
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Comprehensive guides to master French grammar rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notesTopics.map((topic) => (
          <Link key={topic.id} to={topic.path} className="group relative block">
            {/* Background Gradient & Shape */}
            <div
              className={cn(
                "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:opacity-20",
                topic.color
              )}
            />

            <div
              className={cn(
                "relative h-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-6 backdrop-blur-sm transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-xl",
                topic.shadow
              )}
            >
              <div className="flex flex-col gap-4">
                {/* Icon Container */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                    topic.color
                  )}
                >
                  <topic.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {topic.description}
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
