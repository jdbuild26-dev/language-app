import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, X, Volume2, VolumeX } from "lucide-react";
import {
  fetchVocabulary,
  saveUserProgress,
  rateSrsCard,
  fetchSrsDue,
} from "@/services/vocabularyApi";
import FlashcardGame from "../components/flashcards/FlashcardGame";
import { useUser, useAuth } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";

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
  const urlFront = searchParams.get("front"); // Optional front face from setup

  const [words, setWords] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Settings & Filters
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("All");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoPlayAudio: true,
    frontSide: urlFront && urlFront.includes("English") ? "English" : "French",
  });

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
        // 1. Fetch vocabulary words
        const data = await fetchVocabulary({
          level: level === "All" ? undefined : level,
          category,
          subCategory: subCategories,
        });

        if (data && data.words) {
          let loadedWords = data.words;

          // Apply count limit if set
          if (count && count !== "All") {
            const limitNum = parseInt(count, 10);
            if (!isNaN(limitNum)) {
              loadedWords = loadedWords.slice(0, limitNum);
            }
          }

          // 2. Fetch SRS due IDs and sort due cards to the front
          try {
            const token = await getToken();
            const dueIds = await fetchSrsDue({ category, level }, token);
            if (dueIds && dueIds.length > 0) {
              const dueSet = new Set(dueIds);
              const dueCards = loadedWords.filter((w) => dueSet.has(w.id));
              const newCards = loadedWords.filter((w) => !dueSet.has(w.id));
              loadedWords = [...dueCards, ...newCards];
            }
          } catch (srsErr) {
            console.warn("SRS due fetch failed (non-critical):", srsErr);
          }

          setWords(loadedWords);
          setQueue(loadedWords);
          setStats((s) => ({ ...s, total: loadedWords.length }));
        }
      } catch (error) {
        console.error("Failed to load vocabulary", error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadWords();
  }, [level, category, subCategories.join(","), count]);

  const availableLevels = [
    "All",
    ...new Set(words.map((w) => w.level || "A1")),
  ].sort();

  const displayedQueue =
    selectedLevelFilter === "All"
      ? queue
      : queue.filter((w) => (w.level || "A1") === selectedLevelFilter);

  const handleUpdateStats = async (type) => {
    // Current card is the first card in the currently filtered queue
    const currentCard = displayedQueue[0];
    if (!currentCard) return;

    // Remove current card from the main queue
    const newQueue = queue.filter((w) => w.id !== currentCard.id);

    // Determine status string for backend
    let status = "known";
    if (type === "unknown") status = "unknown";
    if (type === "mastered") status = "mastered";

    // Map swipe type to FSRS rating
    const srsRating = type === "unknown" ? 1 : type === "mastered" ? 4 : 3;

    if (user && currentCard) {
      getToken()
        .then((token) => {
          // Fire-and-forget: save progress
          saveUserProgress(
            {
              userId: user.id,
              level: currentCard.level || level || "A1",
              category: currentCard.category || category || "General",
              cards: [
                {
                  cardId: currentCard.id,
                  cardData: currentCard,
                  status: status,
                },
              ],
            },
            token,
          ).catch((err) => console.error("Background save failed", err));

          // Fire-and-forget: update SRS schedule
          rateSrsCard(
            { vocabId: currentCard.id, rating: srsRating },
            token,
          ).catch((err) => console.error("SRS rate failed", err));
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

  if (loadError || (!isLoading && words.length === 0 && queue.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center max-w-md w-full">
          <div className="text-5xl mb-4">{loadError ? "⚠️" : "📭"}</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {loadError ? "Failed to load words" : "No words found"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {loadError
              ? "Could not connect to the server. Make sure the backend is running."
              : `No vocabulary found for the selected category${category ? ` "${category}"` : ""}.`}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors mb-3"
          >
            Try Again
          </button>
          <button
            onClick={handleBack}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Back to Setup
          </button>
        </div>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col relative">
      {/* Settings Modal (Overlay) */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-20 right-6 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Auto-play Settings */}
                <div className="flex items-center justify-between">
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    Auto-play Audio
                  </div>
                  <button
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        autoPlayAudio: !s.autoPlayAudio,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoPlayAudio
                        ? "bg-sky-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoPlayAudio
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Front Side Selector */}
                <div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium mb-3">
                    Start Card With
                  </div>
                  <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, frontSide: "French" }))
                      }
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        settings.frontSide === "French"
                          ? "bg-sky-500 text-white"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      French
                    </button>
                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, frontSide: "English" }))
                      }
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        settings.frontSide === "English"
                          ? "bg-sky-500 text-white"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Quit Session Button hidden away in settings instead of main view */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-2">
                  <button
                    onClick={handleBack}
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-red-200 dark:border-red-900/30"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quit Session
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Container */}
      <div className="px-6 py-4 flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 sticky top-0">
        {/* Left Side: Category Title & Level Tags */}
        <div className="flex items-center gap-4 min-w-[30%]">
          <h1 className="text-xl font-black text-slate-800 dark:text-white">
            {category || "Custom Session"}
          </h1>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
            {availableLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevelFilter(lvl)}
                className={`flex-shrink-0 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm font-bold transition-all ${
                  selectedLevelFilter === lvl
                    ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shadow-sm border border-sky-200 dark:border-sky-800"
                    : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Progress / Stats Badge */}
        <div className="flex items-center justify-center gap-3 min-w-[40%]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.unknown} Review
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.know} Known
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.mastered} Mastered
            </span>
          </div>
          <div className="px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full font-bold text-sm ml-2 border border-sky-200 dark:border-sky-800/50">
            {queue.length} Remaining
          </div>
        </div>

        {/* Right Side: Quick Toggles and Settings Menu */}
        <div className="flex items-center justify-end gap-3 min-w-[30%]">
          {/* Quick Mute Toggle */}
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, autoPlayAudio: !s.autoPlayAudio }))
            }
            className={`p-2 rounded-full shadow-sm border transition-colors ${
              settings.autoPlayAudio
                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-500"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-500"
            }`}
            title={settings.autoPlayAudio ? "Mute audio" : "Enable audio"}
          >
            {settings.autoPlayAudio ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-500 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col justify-center pb-8 pt-4">
        {displayedQueue.length === 0 ? (
          <div className="text-center text-slate-500">
            No words found for this level.
          </div>
        ) : (
          <FlashcardGame
            words={displayedQueue}
            onUpdateStats={handleUpdateStats}
            total={stats.total}
            user={user}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}
