import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function PracticePage() {
  const activities = [
    {
      title: "Fill in the Blank",
      description:
        "Complete sentences by typing the missing words character by character.",
      path: "/vocabulary/practice/fill-in-blank",
      color: "bg-sky-500",
      icon: "📝",
      level: "C1",
    },
    // Future activities can be added here
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-100 dark:bg-sky-900/40 rounded-full mb-6">
            <PencilSquareIcon className="w-10 h-10 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Practice Area
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Reinforce your learning with interactive games and exercises
            designed to test your skills.
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <Link
              key={index}
              to={activity.path}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:-translate-y-1 block"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4",
                  activity.color,
                  "bg-opacity-10 text-opacity-100"
                )}
              >
                {activity.icon}
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-sky-500 transition-colors">
                  {activity.title}
                </h3>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded uppercase">
                  {activity.level}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {activity.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
