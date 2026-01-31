import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchVocabulary, saveUserProgress } from "@/services/vocabularyApi";
import FlashcardGame from "../components/flashcards/FlashcardGame";
import { useUser, useAuth } from "@clerk/clerk-react";

export default function FlashcardsActivityGamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  // Get params
  const level = searchParams.get("level");
  const category = searchParams.get("category");
  const subCategories = searchParams.getAll("sub_category");
  const mode = searchParams.get("mode") || "All";
  const count = searchParams.get("count");
  // const front = searchParams.get("front"); // Use later for card configuration

  const [words, setWords] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    know: 0,
    unknown: 0,
    mastered: 0,
    total: 0,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadWords() {
      setIsLoading(true);
      try {
        // Fetch words with all filters
        const data = await fetchVocabulary({
          level: level === "All" ? undefined : level,
          category,
          subCategory: subCategories,
        });

        if (data && data.words) {
          let loadedWords = data.words;

          // Apply 'Limit' (Count) if strictly needed, though API has limit param.
          // The API 'limit' is simple slicing. If we want random sampling, we might need client side shuffle then slice.
          // For now, let's just slice if count is set (assuming API returned all matching)
          if (count && count !== "All") {
            const limitNum = parseInt(count, 10);
            if (!isNaN(limitNum)) {
              loadedWords = loadedWords.slice(0, limitNum);
            }
          }

          setWords(loadedWords);
          setQueue(loadedWords);
          setStats((s) => ({ ...s, total: loadedWords.length }));
        }
      } catch (error) {
        console.error("Failed to load vocabulary", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadWords();
  }, [level, category, subCategories.join(","), count]);

  const handleUpdateStats = async (type) => {
    // Current card is always queue[0]
    const currentCard = queue[0];
    const newQueue = queue.slice(1); // Remove current card

    // Determine status string for backend
    let status = "known";
    if (type === "unknown") status = "unknown";
    if (type === "mastered") status = "mastered";

    // Save progress to backend (fire and forget for UI snappiness, or await if critical)
    if (user && currentCard) {
      getToken()
        .then((token) => {
          saveUserProgress(
            {
              userId: user.id,
              level: currentCard.level || level || "A1", // Fallback if card missing level
              category: currentCard.category || category || "General",
              cards: [
                {
                  cardId: currentCard.id,
                  cardData: currentCard,
                  status: status,
                },
              ],
            },
            token
          ).catch((err) => console.error("Background save failed", err));
        })
        .catch((err) => console.error("Failed to get token", err));
    }

    if (type === "unknown") {
      setQueue([...newQueue, currentCard]);
      setStats((s) => ({ ...s, unknown: s.unknown + 1 }));
    } else if (type === "know" || type === "mastered") {
      setQueue(newQueue);
      setStats((s) => ({ ...s, know: s.know + 1 }));
    }
  };

  const handleBack = () => {
    navigate("/vocabulary/lessons/activities/flashcards");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Completion State
  if (queue.length === 0 && words.length > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
            Session Complete! 🎉
          </h2>
          <p className="text-slate-500 mb-8">
            You've finished your custom practice session.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <p className="text-2xl font-bold text-emerald-600">
                {stats.know}
              </p>
              <p className="text-sm text-emerald-600/70 uppercase font-bold tracking-wide">
                Known
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
              <p className="text-2xl font-bold text-orange-600">
                {stats.unknown}
              </p>
              <p className="text-sm text-orange-600/70 uppercase font-bold tracking-wide">
                Review
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Practice Same Set Again
          </button>
          <button
            onClick={handleBack}
            className="w-full mt-3 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
          >
            New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Quit Session
        </button>

        {/* Progress / Stats Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.unknown} Review
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.know} Known
            </span>
          </div>
        </div>

        <div className="px-4 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full font-bold text-sm">
          {queue.length} Remaining
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col justify-center pb-20">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {category || "Custom Session"}
          </h2>
          <div className="inline-flex gap-2">
            {level && (
              <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
                {level}
              </span>
            )}
            {subCategories.length > 0 && (
              <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
                {subCategories.length} Filters
              </span>
            )}
          </div>
        </div>

        {words.length === 0 ? (
          <div className="text-center text-slate-500">
            No words found matching these filters. <br />
            <button
              onClick={handleBack}
              className="text-sky-500 font-bold mt-2 hover:underline"
            >
              Go Back
            </button>
          </div>
        ) : (
          <FlashcardGame
            words={queue}
            onUpdateStats={handleUpdateStats}
            total={stats.total}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
