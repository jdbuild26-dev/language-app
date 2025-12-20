import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";

export default function ReviewWordsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/vocabulary/lessons/review"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review Words
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Review vocabulary cards you've marked for learning using spaced
          repetition.
        </p>
      </div>

      {/* Placeholder content */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
        <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-sky-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Words to Review
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
          Words you mark for review while learning will appear here. Start
          learning vocabulary and mark cards to build your review list.
        </p>
      </div>
    </div>
  );
}
