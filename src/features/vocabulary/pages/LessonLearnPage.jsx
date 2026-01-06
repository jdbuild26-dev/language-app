import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import {
  LearningCard,
  LessonHeader,
  CompletionScreen,
} from "../components/lesson-learn";
import { fetchVocabulary } from "../../../services/vocabularyApi";
import { saveProgress, getLessonProgress } from "../../../services/progressApi";

export default function LessonLearnPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { level, category, topic } = useParams();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Determine the category to use (from level/category route or topic route)
  const categoryToUse = category || topic;
  const displayName = categoryToUse
    ? categoryToUse
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  // Load words and check for resume position
  const loadWordsAndProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch vocabulary filtered by level and/or category
      const data = await fetchVocabulary({
        level: level?.toUpperCase(),
        category: categoryToUse,
      });

      const fetchedWords = data.words || [];
      setWords(fetchedWords);

      // Check for saved progress to resume
      if (user && level && categoryToUse && fetchedWords.length > 0) {
        try {
          const progress = await getLessonProgress(
            user.id,
            level,
            categoryToUse
          );

          if (
            progress.learnedCount > 0 &&
            progress.learnedCount < fetchedWords.length
          ) {
            // Resume from next unlearned card
            setCurrentIndex(progress.learnedCount);
          } else if (progress.learnedCount >= fetchedWords.length) {
            // All cards learned - show completion
            setCurrentIndex(fetchedWords.length - 1);
            setIsCompleted(true);
          }
        } catch (progressErr) {
          // Ignore progress error, start from beginning
          console.warn("Could not load progress, starting from beginning");
        }
      }
    } catch (err) {
      console.error("Failed to fetch vocabulary:", err);
      setError("Failed to load vocabulary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [level, categoryToUse, user]);

  useEffect(() => {
    loadWordsAndProgress();
  }, [loadWordsAndProgress]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
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

  const handleSaveAndExit = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    try {
      // Save cards from 0 to currentIndex (inclusive)
      const cardsToSave = words.slice(0, currentIndex + 1);

      await saveProgress(user.id, level || "A1", categoryToUse, cardsToSave);

      // Navigate back after save
      navigate(-1);
    } catch (err) {
      console.error("Failed to save progress:", err);
      // Still navigate even if save fails
      navigate(-1);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">
            Loading vocabulary...
          </p>
        </div>
      </div>,
      document.body
    );
  }

  // Error state
  if (error) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // No words found
  if (words.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            No vocabulary words found for this lesson.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>,
      document.body
    );
  }

  if (isCompleted) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
        <LessonHeader
          currentIndex={words.length - 1}
          total={words.length}
          onExit={handleExit}
          onSaveAndExit={handleSaveAndExit}
          isSaving={isSaving}
          words={words}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <CompletionScreen wordCount={words.length} categoryName={category} />
        </main>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-slate-950 flex flex-col overflow-y-auto">
      <LessonHeader
        currentIndex={currentIndex}
        total={words.length}
        onExit={handleExit}
        onSaveAndExit={handleSaveAndExit}
        isSaving={isSaving}
        words={words}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-12 relative">
        <div className="w-full max-w-[90rem] relative">
          <LearningCard word={words[currentIndex]} />

          {/* Navigation Buttons - Anchored to card edges */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-6 z-20">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-105"
            >
              <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-6 z-20">
            <button
              onClick={handleNext}
              className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-105"
            >
              <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>,
    document.body
  );
}
