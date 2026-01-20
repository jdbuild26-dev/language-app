import { Link } from "react-router-dom";
import { ArrowRightIcon, BookOpenIcon } from "@heroicons/react/24/outline";

// CEFR level data for stories
const cefrLevelsData = [
  {
    level: "A1",
    title: "A1 Level Stories",
    description:
      "Beginner-level stories with simple vocabulary and basic grammar. Perfect for those just starting their French learning journey.",
    storyCount: 32,
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    textColor: "text-sky-500 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800",
    progressColor: "bg-sky-500",
  },
  {
    level: "A2",
    title: "A2 Level Stories",
    description:
      "Elementary-level stories that introduce more vocabulary and slightly more complex sentence structures.",
    storyCount: 32,
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    textColor: "text-sky-400 dark:text-sky-300",
    borderColor: "border-sky-200 dark:border-sky-800",
    progressColor: "bg-sky-400",
  },
  {
    level: "B1",
    title: "B1 Level Stories",
    description:
      "Intermediate-level stories with richer vocabulary and more nuanced grammar patterns.",
    storyCount: 32,
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    textColor: "text-teal-500 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
    progressColor: "bg-teal-500",
  },
  {
    level: "B2",
    title: "B2 Level Stories",
    description:
      "Upper-intermediate stories with advanced vocabulary and complex sentence structures.",
    storyCount: 0,
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    textColor: "text-teal-400 dark:text-teal-300",
    borderColor: "border-teal-200 dark:border-teal-800",
    progressColor: "bg-teal-400",
  },
];

// Level Card Component
function LevelCard({
  level,
  title,
  description,
  storyCount,
  bgColor,
  textColor,
  borderColor,
}) {
  return (
    <div
      className={`relative rounded-xl ${borderColor} border-2 p-4 flex gap-4 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow`}
    >
      {/* Level Icon */}
      <div
        className={`w-20 h-24 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}
      >
        <span className={`text-3xl font-bold ${textColor}`}>{level}</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 my-2">
          {description}
        </p>

        {/* Stats and Arrow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpenIcon className="w-3.5 h-3.5" />
              {storyCount} Stories
            </span>
          </div>

          <Link
            to={`/stories/learn/by-level/${level.toLowerCase()}`}
            className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StoriesLevelPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          By CEFR Level
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
          Here, you can learn through stories that make the language natural and
          engaging. Each story helps you build vocabulary in real contexts
          rather than in isolation. You can explore words organized by grammar
          categories such as verbs, adjectives, and expressions, as well as by
          level from beginner to advanced.
        </p>
      </div>

      {/* Grid of Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cefrLevelsData.map((level) => (
          <LevelCard key={level.level} {...level} />
        ))}
      </div>
    </div>
  );
}
