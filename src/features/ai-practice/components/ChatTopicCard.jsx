import { Link } from "react-router-dom";
import { MessageCircle, Clock, Star } from "lucide-react";

// Difficulty badge colors
const difficultyColors = {
  beginner: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  intermediate: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  advanced: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
};

export default function ChatTopicCard({ topic }) {
  const colors =
    difficultyColors[topic.difficulty] || difficultyColors.beginner;

  return (
    <Link
      to={`/ai-practice/scenarios/chats/${topic.slug}/chat`}
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-300"
    >
      {/* Image/Icon Header */}
      <div className="relative h-36 bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-200/50 dark:bg-sky-700/30 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-indigo-200/50 dark:bg-indigo-700/30 rounded-full" />

        {/* Icon */}
        <div className="relative z-10 w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <span className="text-3xl">{topic.icon}</span>
        </div>

        {/* Difficulty Badge */}
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {topic.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2">
          {topic.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {topic.estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {topic.messageCount} msgs
          </span>
          {topic.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {topic.rating}
            </span>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div className="px-5 pb-5">
        <div className="w-full py-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center text-sm font-medium text-gray-600 dark:text-slate-300 group-hover:bg-sky-500 group-hover:text-white transition-colors">
          Start Conversation
        </div>
      </div>
    </Link>
  );
}
