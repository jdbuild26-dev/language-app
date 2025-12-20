import { Link } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";

export default function MyWordlistsPage() {
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
          My Wordlists
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          View and manage your custom vocabulary collections.
        </p>
      </div>

      {/* Placeholder content */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
        <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-sky-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Wordlists Yet
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
          Create custom wordlists to organize your vocabulary learning journey.
          Your saved collections will appear here.
        </p>
      </div>
    </div>
  );
}
