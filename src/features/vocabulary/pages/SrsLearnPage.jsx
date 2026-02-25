import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import {
  LearningCard,
  LessonHeader,
  CompletionScreen,
} from "../components/lesson-learn";
import { fetchLearningQueue, trackEvent } from "@/services/vocabularyApi";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SrsLearnPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { learningLang, knownLang } = useLanguage();

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
        learningLang,
        knownLang,
      });

      const newQueue = data.queue || [];

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
  }, [user, level, categoryToUse, learningLang, knownLang]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleNext = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const currentItem = queue[currentIndex];

    try {
      await trackEvent({
        userId: user.id,
        itemId: currentItem.id, // Ensure this maps to 'Unique ID' or backend ID
        interactionType: "known", // default to known
        type: "vocab",
      });

      if (currentIndex < queue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-12 relative">
        <div className="w-full max-w-[90rem] relative">
          <LearningCard word={currentWord} />

          {/* Navigation Buttons - Anchored to card edges */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-6 z-20">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isProcessing}
              className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-105"
            >
              <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-6 z-20">
            <button
              onClick={handleNext}
              disabled={isProcessing}
              className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-105"
            >
              <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>,
    document.body,
  );
}
