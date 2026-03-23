import {
  CheckCircleIcon,
  RectangleStackIcon,
  LanguageIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import ActionCard from "@/features/vocabulary/components/lesson-learn/ActionCard";

export default function CompletionScreen({ wordCount = 0, categoryName = "" }) {
  // Format category name for display (convert slug to readable)
  const formatCategoryName = (name) => {
    if (!name) return "this category";
    // Replace hyphens with spaces and capitalize
    return name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto text-center py-12 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircleIcon className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Congratulations!!
      </h2>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-12 max-w-xl mx-auto">
        You learned{" "}
        <span className="font-bold text-gray-900 dark:text-white">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>{" "}
        from {formatCategoryName(categoryName)}. To improve learning and review
        vocabulary, start practicing.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto px-4">
        <ActionCard icon={RectangleStackIcon} label="Flashcards" color="sky" />
        <ActionCard
          icon={LanguageIcon}
          label="Match the pairs"
          color="orange"
        />
        <ActionCard
          icon={BookOpenIcon}
          label="Spelling Practice"
          color="teal"
        />
      </div>
    </div>
  );
}
