import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import {
  LearningCard,
  LessonHeader,
  CompletionScreen,
} from "../components/lesson-learn";
import {
  fetchLearningQueue,
  trackEvent,
} from "../../../services/vocabularyApi";

export default function SrsLearnPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  // Read optional URL params (similar to LessonLearnPage)
  const queryParams = new URLSearchParams(location.search);
  // If we are using route params like /lessons/learn/:level/:category
  // We can use useLocation or useParams?
  // Let's use useLocation search params for /learn?level=A1 logic if used there
  // BUT app routes use /:level/:category
  // So we import useParams
  const { level, category, topic } = useParams();

  const categoryToUse = category || topic;

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Processing a grade
  const [error, setError] = useState(null);
  const [showButtons, setShowButtons] = useState(false); // Show grading buttons after flip

  // Determine current stats if needed
  const reviewsCount = queue.filter((w) => w.isReview).length;
  const newCount = queue.filter((w) => !w.isReview).length;

  const loadQueue = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchLearningQueue({
        userId: user.id,
        dailyLimitReviews: 150,
        dailyLimitNew: 20,
        level: level,
        category: categoryToUse,
      });

      const newQueue = data.queue || [];
      console.log("[SrsLearnPage] Loaded Learning Queue:", newQueue);
      console.log(
        `[SrsLearnPage] Stats: ${data.reviewsCount} Reviews, ${data.newCount} New Cards`,
      );

      setQueue(newQueue);

      if (newQueue.length === 0) {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error("Failed to fetch SRS queue:", err);
      setError("Failed to load your review queue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user, level, categoryToUse]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleGrade = async (rating) => {
    console.log(`[SrsLearnPage] User graded card: ${rating}`);
    // rating: 'unknown' (Again), 'hard', 'known' (Good), 'mastered' (Easy)
    if (isProcessing) return;
    setIsProcessing(true);

    const currentItem = queue[currentIndex];

    try {
      // Optimistic UI: Move to next card immediately?
      // Or wait for API? Better to wait for API to ensure sync, or at least fire and forget?
      // Let's fire and forget for speed, but handle errors silently or retry?
      // For SRS, data integrity is important. Let's await.

      await trackEvent({
        userId: user.id,
        itemId: currentItem.id, // Ensure this maps to 'Unique ID' or backend ID
        interactionType: rating,
        type: "vocab",
      });

      console.log(
        `[SrsLearnPage] Successfully tracked event for item: ${currentItem.id}`,
      );

      if (currentIndex < queue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setShowButtons(false); // Reset UI for next card
      } else {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error("[SrsLearnPage] Failed to track event:", err);
      // Maybe show toast? For now just log.
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExit = () => {
    navigate(-1);
  };

  // Wrapper for LearningCard to detect "flip" if possible?
  // Since LearningCard encapsulates flip state, we might need to modify it or provide a "onFlip" prop if it supports it.
  // If not, we can assume user flips it manually and simple provide the buttons ALWAYS or below the card.
  // Ideally buttons appear only after answer is shown.
  // For this MVP, let's show buttons at the bottom always, or use a "Show Answer" button first.

  // Custom "Show Answer" logic if LearningCard doesn't expose it?
  // If LearningCard is a black box, let's assume it has its own flip.
  // We can place the buttons below it.

  // Helper to handle "Show Answer" if we can wrap the card content?
  // Let's rely on user clicking the card (LearningCard usually handles click to flip).
  // We'll show the grading buttons at the bottom.

  if (isLoading) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">
            Loading your reviews...
          </p>
        </div>
      </div>,
      document.body,
    );
  }

  if (error) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
          >
            Go Back
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  if (isCompleted && queue.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">All caught up! 🎉</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            You have no more reviews for today.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
          >
            Go Back
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  if (isCompleted) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
        <LessonHeader
          currentIndex={queue.length}
          total={queue.length}
          onExit={handleExit}
          words={queue}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <CompletionScreen
            wordCount={queue.length}
            categoryName="Review Session"
          />
        </main>
      </div>,
      document.body,
    );
  }

  const currentWord = queue[currentIndex];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-slate-950 flex flex-col overflow-y-auto">
      <LessonHeader
        currentIndex={currentIndex}
        total={queue.length}
        onExit={handleExit}
        // No "Save and Exit" needed for SRS as we save per card.
        onSaveAndExit={handleExit}
        isSaving={false} // Always false
        words={queue}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-32 relative">
        <div className="w-full max-w-[90rem] flex flex-col items-center gap-8">
          {/* Card */}
          <div onClick={() => setShowButtons(true)}>
            {/* We wrap it to detect click/interaction for showing buttons? 
                 Or simply show buttons always? 
                 Let's Show "Show Answer" button first if not shown. */}
            <LearningCard word={currentWord} />
          </div>

          {/* Grading Controls */}
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-4 items-center">
            {!showButtons ? (
              <button
                onClick={() => setShowButtons(true)}
                className="w-full py-4 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors shadow-sm text-lg"
              >
                Show Answer
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-2 w-full">
                {/* Again (1) */}
                <button
                  onClick={() => handleGrade("unknown")}
                  disabled={isProcessing}
                  className="flex flex-col items-center py-3 px-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                >
                  <span className="font-bold text-sm md:text-base">Again</span>
                  <span className="text-xs opacity-70">1m</span>
                </button>

                {/* Hard (2) */}
                <button
                  onClick={() => handleGrade("hard")}
                  disabled={isProcessing}
                  className="flex flex-col items-center py-3 px-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors border border-orange-100"
                >
                  <span className="font-bold text-sm md:text-base">Hard</span>
                  <span className="text-xs opacity-70">2d</span>
                </button>

                {/* Good (3) */}
                <button
                  onClick={() => handleGrade("known")}
                  disabled={isProcessing}
                  className="flex flex-col items-center py-3 px-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
                >
                  <span className="font-bold text-sm md:text-base">Good</span>
                  <span className="text-xs opacity-70">4d</span>
                </button>

                {/* Easy (4) */}
                <button
                  onClick={() => handleGrade("mastered")}
                  disabled={isProcessing}
                  className="flex flex-col items-center py-3 px-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  <span className="font-bold text-sm md:text-base">Easy</span>
                  <span className="text-xs opacity-70">7d</span>
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 text-xs text-gray-400">
              <span>NEW: {newCount}</span>
              <span>REVIEW: {reviewsCount}</span>
            </div>
          </div>
        </div>
      </main>
    </div>,
    document.body,
  );
}
