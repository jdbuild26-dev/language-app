import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchVocabulary } from "@/services/vocabularyApi";
import FlashcardGame from "../components/flashcards/FlashcardGame";

export default function FlashcardsPage() {
  const { level, category } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    async function loadWords() {
      setIsLoading(true);
      try {
        // Fetch words for the level/category
        const data = await fetchVocabulary({ level, category });
        if (data && data.words) {
          setWords(data.words);
          setQueue(data.words); // Initial queue is all words
          setStats((s) => ({ ...s, total: data.words.length }));
        }
      } catch (error) {
        console.error("Failed to load vocabulary", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadWords();
  }, [level, category]);

  const handleUpdateStats = (type) => {
    // Current card is always queue[0]
    const currentCard = queue[0];
    const newQueue = queue.slice(1); // Remove current card

    if (type === "unknown") {
      // "Don't Know" -> Move to back of queue? Or just count it?
      // Usually flashcards re-queue unknown cards.
      // Let's re-queue it at the end for now to ensure mastery.
      setQueue([...newQueue, currentCard]);
      setStats((s) => ({ ...s, unknown: s.unknown + 1 }));
    } else if (type === "know" || type === "mastered") {
      // "Know" / "Mastered" -> Remove from queue permanently
      setQueue(newQueue);
      setStats((s) => ({ ...s, know: s.know + 1 }));
    }
  };

  const handleBack = () => {
    navigate(-1);
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
            Great Job! 🎉
          </h2>
          <p className="text-slate-500 mb-8">
            You've reviewed all cards in this set.
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
            Practice Again
          </button>
          <button
            onClick={handleBack}
            className="w-full mt-3 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
          >
            Back to Level
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
          Back
        </button>

        {/* Progress / Stats Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.unknown} Still learning
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.know} Know
            </span>
          </div>
        </div>

        <div className="px-4 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full font-bold text-sm">
          Cards: {queue.length}/{stats.total}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col justify-center pb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-4 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">
              {category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase">
              {level}
            </span>
          </div>
        </div>

        <FlashcardGame
          words={queue}
          onUpdateStats={handleUpdateStats}
          total={stats.total}
        />
      </div>
    </div>
  );
}
