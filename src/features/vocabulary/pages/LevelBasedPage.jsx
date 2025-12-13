import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BookmarkIcon,
  BookOpenIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Hardcoded CEFR level data (will come from backend later)
const cefrLevelsData = [
  {
    level: "A1",
    title: "A1 Level Wordlist",
    description:
      "A1 vocabulary list includes 32 lessons categorized by topic, difficulty, and usage according to CEFR. This is the first step in your vocabulary learning.",
    lessons: 32,
    words: 609,
    time: "5h 5m",
    progress: 3,
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    textColor: "text-sky-500 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800",
    progressColor: "bg-sky-500",
  },
  {
    level: "A2",
    title: "A2 Level Wordlist",
    description:
      "Here you will find 50 lessons categorized by topic, difficulty, and usage according to CEFR. This is the second step in your vocabulary learning journey.",
    lessons: 50,
    words: 1581,
    time: "13h 11m",
    progress: 0,
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    textColor: "text-sky-400 dark:text-sky-300",
    borderColor: "border-sky-200 dark:border-sky-800",
    progressColor: "bg-sky-400",
  },
  {
    level: "B1",
    title: "B1 Level Wordlist",
    description:
      "Here you will find 58 lessons categorized by topic, difficulty, and usage according to CEFR. This is the third step in your vocabulary learning journey.",
    lessons: 58,
    words: 1823,
    time: "15h 20m",
    progress: 0,
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    textColor: "text-teal-500 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
    progressColor: "bg-teal-500",
  },
  {
    level: "B2",
    title: "B2 Level Wordlist",
    description:
      "Here you will find 64 lessons categorized by topic, difficulty, and usage according to CEFR. This is the fourth step in your vocabulary learning journey.",
    lessons: 64,
    words: 2105,
    time: "18h 45m",
    progress: 0,
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    textColor: "text-teal-400 dark:text-teal-300",
    borderColor: "border-teal-200 dark:border-teal-800",
    progressColor: "bg-teal-400",
  },
  {
    level: "C1",
    title: "C1 Level Wordlist",
    description:
      "Here you will find 67 lessons categorized by topic, difficulty, and usage according to CEFR. This is the fifth step in your vocabulary learning journey.",
    lessons: 67,
    words: 2481,
    time: "20h 41m",
    progress: 0,
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-500 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    progressColor: "bg-orange-500",
  },
  {
    level: "C2",
    title: "C2 Level Wordlist",
    description:
      "Here you will find vocabulary lessons categorized by topic, from shapes to politics. This will take you to the sixth stage of your vocabulary learning journey.",
    lessons: 89,
    words: 2152,
    time: "17h 57m",
    progress: 0,
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-400 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-800",
    progressColor: "bg-orange-400",
  },
];

// CEFR Level Card Component
function LevelCard({
  level,
  title,
  description,
  lessons,
  words,
  time,
  progress,
  bgColor,
  textColor,
  borderColor,
  progressColor,
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
        {/* Header with title and bookmark */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            className="p-1 text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            title="Add to My Wordlist"
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 my-2">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} rounded-full transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-slate-500 min-w-[28px] text-right">
            {progress}%
          </span>
        </div>

        {/* Stats and Arrow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpenIcon className="w-3.5 h-3.5" />
              {lessons} Lesson
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
              {words} Words
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {time}
            </span>
          </div>

          <Link
            to={`/vocabulary/cefr/${level.toLowerCase()}`}
            className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LevelBasedPage() {
  // TODO: Get this from context/state when language selector is wired up
  const learningLanguage = "English";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Level-Based {learningLanguage} Vocabulary
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Master vocabulary step by step with our CEFR-aligned wordlists. Each
          level builds upon the previous, ensuring steady progress, better
          retention, and the confidence to speak and understand naturally in
          real situations.
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
