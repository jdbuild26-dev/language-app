import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  BookmarkIcon,
  BookOpenIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { fetchCategoriesByLevel, fetchVocabulary } from "../../../services/vocabularyApi";
import { getLessonProgress } from "../../../services/progressApi";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  bulkAddToReview,
  bulkRemoveFromReview,
  checkCategoryBookmarked,
} from "../../../services/reviewCardsApi";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

// Level colors config
const levelColors = {
  a1: {
    bg: "bg-sky-500",
    text: "text-sky-500",
    progressBg: "bg-sky-100 dark:bg-sky-900/30",
    progressFill: "bg-sky-500",
  },
  a2: {
    bg: "bg-sky-400",
    text: "text-sky-400",
    progressBg: "bg-sky-100 dark:bg-sky-900/30",
    progressFill: "bg-sky-400",
  },
  b1: {
    bg: "bg-teal-500",
    text: "text-teal-500",
    progressBg: "bg-teal-100 dark:bg-teal-900/30",
    progressFill: "bg-teal-500",
  },
  b2: {
    bg: "bg-teal-400",
    text: "text-teal-400",
    progressBg: "bg-teal-100 dark:bg-teal-900/30",
    progressFill: "bg-teal-400",
  },
  c1: {
    bg: "bg-orange-500",
    text: "text-orange-500",
    progressBg: "bg-orange-100 dark:bg-orange-900/30",
    progressFill: "bg-orange-500",
  },
  c2: {
    bg: "bg-orange-400",
    text: "text-orange-400",
    progressBg: "bg-orange-100 dark:bg-orange-900/30",
    progressFill: "bg-orange-400",
  },
};

// Action button component
function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
      title={label}
    >
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
        <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
      </div>
    </button>
  );
}

// Category Card component with progress
function CategoryCard({
  category,
  levelColor,
  level,
  learnedCount = 0,
  isBookmarked = false,
  onBookmarkClick,
}) {
  const navigate = useNavigate();
  const totalWords = category.wordCount || 1;
  const progressPercent = Math.min(
    Math.round((learnedCount / totalWords) * 100),
    100
  );

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookmarkClick) {
      onBookmarkClick(category, isBookmarked);
    }
  };

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on interactive elements
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.getAttribute("role") === "button"
    ) {
      return;
    }
    navigate(`/vocabulary/lessons/learn/${level}/${category.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-all cursor-pointer relative group"
    >
      {/* Image and Bookmark */}
      <div className="relative mb-4">
        {/* Placeholder image */}
        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">📚</span>
          </div>
        </div>
        {/* Bookmark */}
        <button
          onClick={handleBookmarkClick}
          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${isBookmarked
              ? "bg-sky-500 hover:bg-sky-600"
              : "bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700"
            }`}
          title={isBookmarked ? "Remove from wordlist" : "Add to wordlist"}
        >
          {isBookmarked ? (
            <BookmarkSolidIcon className="w-4 h-4 text-white" />
          ) : (
            <BookmarkIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          )}
        </button>
      </div>

      {/* Title - fixed height for consistency */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 h-14">
        {category.name}
      </h3>

      {/* Subcategories - fixed height for consistency */}
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 h-10">
        {category.subcategories.length > 0
          ? category.subcategories.slice(0, 3).join(", ")
          : "Learn vocabulary in this category"}
      </p>

      {/* Bottom section - pushed to bottom with mt-auto */}
      <div className="mt-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`flex-1 h-1.5 ${levelColor.progressBg} rounded-full overflow-hidden`}
          >
            <div
              className={`h-full ${levelColor.progressFill} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-slate-500 min-w-[36px] text-right">
            {learnedCount}/{totalWords}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700 whitespace-nowrap">
          <span className="flex items-center gap-1">
            <BookOpenIcon className="w-3.5 h-3.5" />
            {category.wordCount} Words
          </span>
          <span className="flex items-center gap-1">
            {category.subcategories.length} Topics
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center justify-between"
        onClick={(e) => e.preventDefault()}
      >
        <Link to={`/vocabulary/flashcards/${level}/${category.slug}`}>
          <ActionButton icon={RectangleStackIcon} label="Flashcards" />
        </Link>
        <ActionButton icon={Squares2X2Icon} label="Learning Card" />
        <ActionButton icon={LanguageIcon} label="Match the pairs" />
        <ActionButton icon={BookOpenIcon} label="Spelling" />
      </div>
    </div>
  );
}

export default function CEFRLevelPage() {
  const { level } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { learningLang } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const colors = levelColors[level] || levelColors.a1;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isRemoveAction, setIsRemoveAction] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCategoriesByLevel(level?.toUpperCase());
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, [level]);

  // Fetch progress for each category when user is available
  useEffect(() => {
    async function loadProgress() {
      if (!user || categories.length === 0) return;

      const progressPromises = categories.map(async (category) => {
        try {
          const token = await getToken();
          const progress = await getLessonProgress(token, learningLang, level, category.slug);
          return { slug: category.slug, count: progress.learnedCount };
        } catch {
          return { slug: category.slug, count: 0 };
        }
      });

      const results = await Promise.all(progressPromises);
      const map = {};
      results.forEach((r) => {
        map[r.slug] = r.count;
      });
      setProgressMap(map);
    }

    loadProgress();
  }, [user, categories, level, getToken]);

  // Check bookmark status for each category
  useEffect(() => {
    async function loadBookmarkStatus() {
      if (!user || categories.length === 0) return;

      const bookmarkPromises = categories.map(async (category) => {
        try {
          const token = await getToken();
          const result = await checkCategoryBookmarked(
            token,
            level?.toUpperCase(),
            category.name
          );
          return { slug: category.slug, isBookmarked: result.isBookmarked };
        } catch {
          return { slug: category.slug, isBookmarked: false };
        }
      });

      const results = await Promise.all(bookmarkPromises);
      const map = {};
      results.forEach((r) => {
        map[r.slug] = r.isBookmarked;
      });
      setBookmarkMap(map);
    }

    loadBookmarkStatus();
  }, [user, categories, level, getToken]);

  // Handle bookmark click - show modal
  const handleBookmarkClick = (category, isCurrentlyBookmarked) => {
    setSelectedCategory(category);
    setIsRemoveAction(isCurrentlyBookmarked);
    setModalOpen(true);
  };

  // Handle modal confirm
  const handleConfirm = async () => {
    if (!user || !selectedCategory) return;

    setModalLoading(true);
    try {
      if (isRemoveAction) {
        // Remove all cards from this category
        const token = await getToken();
        await bulkRemoveFromReview(
          token,
          level?.toUpperCase(),
          selectedCategory.name
        );
        setBookmarkMap((prev) => ({
          ...prev,
          [selectedCategory.slug]: false,
        }));
      } else {
        // Fetch all words for this category and add them
        const vocabData = await fetchVocabulary({
          level: level?.toUpperCase(),
          category: selectedCategory.slug,
        });

        if (vocabData.words && vocabData.words.length > 0) {
          const token = await getToken();
          await bulkAddToReview(
            token,
            level?.toUpperCase(),
            selectedCategory.slug,
            vocabData.words
          );
          setBookmarkMap((prev) => ({
            ...prev,
            [selectedCategory.slug]: true,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to update bookmark:", err);
    } finally {
      setModalLoading(false);
      setModalOpen(false);
      setSelectedCategory(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">
              Loading categories...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {level?.toUpperCase()} Level Wordlist
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Explore {categories.length} vocabulary categories. Each category
          includes flashcards and exercises to help you master new words.
        </p>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            levelColor={colors}
            level={level}
            learnedCount={progressMap[category.slug] || 0}
            isBookmarked={bookmarkMap[category.slug] || false}
            onBookmarkClick={handleBookmarkClick}
          />
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isLoading={modalLoading}
        title={isRemoveAction ? "Remove from Wordlist" : "Add to Wordlist"}
        message={
          isRemoveAction
            ? `Are you sure you want to remove all ${selectedCategory?.wordCount || 0
            } words from "${selectedCategory?.name}" from your wordlist?`
            : `Add all ${selectedCategory?.wordCount || 0} words from "${selectedCategory?.name
            }" to your wordlist for practice?`
        }
        confirmLabel={isRemoveAction ? "Remove All" : "Add All"}
        variant={isRemoveAction ? "danger" : "primary"}
      />
    </div>
  );
}
