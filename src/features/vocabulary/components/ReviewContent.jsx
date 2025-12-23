import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { RectangleStackIcon, BookmarkIcon } from "@heroicons/react/24/outline";

const reviewSections = [
  {
    title: "My Wordlist",
    description: "View and practice words you've saved for learning.",
    icon: BookmarkIcon,
    to: "/vocabulary/lessons/review/words",
  },
  {
    title: "Review Words",
    description:
      "Review all the vocabulary you've learned and track your progress.",
    icon: RectangleStackIcon,
    to: "/vocabulary/lessons/review/wordlists",
  },
];

function ReviewCard({ title, description, icon: Icon, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between p-5 bg-sky-50 dark:bg-slate-800/50 rounded-2xl border border-sky-100 dark:border-slate-700 hover:shadow-md hover:border-sky-200 dark:hover:border-slate-600 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5 text-gray-600 dark:text-slate-300" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 hidden sm:block">
            {description}
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
    </Link>
  );
}

export default function ReviewContent() {
  return (
    <div className="space-y-4 mt-4">
      {reviewSections.map((section) => (
        <ReviewCard
          key={section.title}
          title={section.title}
          description={section.description}
          icon={section.icon}
          to={section.to}
        />
      ))}
    </div>
  );
}
