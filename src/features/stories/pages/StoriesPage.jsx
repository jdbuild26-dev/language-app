import React, { useEffect } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStoriesList } from "../../../services/storiesApi";

export default function StoriesPage() {
  const { stories, loading, error, getStories } = useStoriesList();

  useEffect(() => {
    getStories();
  }, [getStories]);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Stories
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Improve reading comprehension with engaging stories.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          Error loading stories: {error}
        </div>
      )}

      {!loading && !error && stories.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No stories found. Please check back later.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Link
            key={story.id}
            to={`/stories/${story.id}`}
            className="group relative block"
          >
            {/* Background Gradient & Shape */}
            <div
              className={cn(
                "absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 opacity-10 transition-all duration-300 group-hover:opacity-20",
              )}
            />

            <div
              className={cn(
                "relative h-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-6 backdrop-blur-sm transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20",
              )}
            >
              <div className="flex flex-col gap-4">
                {/* Icon Container */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                  )}
                >
                  <BookOpen className="h-6 w-6" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {story.name.replace(".html", "")}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    Click to read story
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
