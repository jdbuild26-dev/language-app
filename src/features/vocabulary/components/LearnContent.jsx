import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

// CEFR Level configuration with colors
const cefrLevels = [
  {
    level: "A1",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    textColor: "text-sky-500 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800",
  },
  {
    level: "A2",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    textColor: "text-sky-400 dark:text-sky-300",
    borderColor: "border-sky-200 dark:border-sky-800",
  },
  {
    level: "B1",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    textColor: "text-teal-500 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
  },
  {
    level: "B2",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    textColor: "text-teal-400 dark:text-teal-300",
    borderColor: "border-teal-200 dark:border-teal-800",
  },
  {
    level: "C1",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-500 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  {
    level: "C2",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-400 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
];

// Level Button Component
function LevelButton({ level, bgColor, textColor, borderColor }) {
  return (
    <Link
      to={`/vocabulary/cefr/${level.toLowerCase()}`}
      className="flex flex-col items-center gap-2 group flex-1"
    >
      <div
        className={`w-full h-24 rounded-xl ${bgColor} ${borderColor} border-2 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg`}
      >
        <span className={`text-3xl font-bold ${textColor}`}>{level}</span>
      </div>
      <span className="text-xs text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors whitespace-nowrap">
        {level} Level Wordlist
      </span>
    </Link>
  );
}

// Section Card Component
function SectionCard({ title, description, to }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border-l-4 border-sky-500 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <Link
          to={to}
          className="flex-shrink-0 text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 group transition-colors"
        >
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default function LearnContent() {
  // TODO: Get this from context/state when language selector is wired up
  const learningLanguage = "English";

  return (
    <div className="space-y-8 mt-4">
      {/* Level-Based Vocabulary Section */}
      <section className="space-y-4">
        <SectionCard
          title={`Level-Based ${learningLanguage} Vocabulary`}
          description="Here you will find different wordlists categorized by level according to CEFR."
          to="/vocabulary/level-based"
        />

        {/* CEFR Level Buttons - Full width below */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {cefrLevels.map((item) => (
            <LevelButton key={item.level} {...item} />
          ))}
        </div>
      </section>

      {/* Topical Vocabulary Section */}
      <section>
        <SectionCard
          title="Topical Vocabulary"
          description="Here you will find extensive wordlists categorized by topic. Each topic includes subcategories that will help you expand your vocabulary knowledge."
          to="/vocabulary/topics"
        />
      </section>
    </div>
  );
}
