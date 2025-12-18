import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import {
  FlashCard,
  LessonHeader,
  CompletionScreen,
} from "../components/lesson-learn";
import { fetchLessonWords } from "../../../services/vocabularyApi";

export default function LessonLearnPage() {
  const navigate = useNavigate();
  const { level, lessonId } = useParams();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWords() {
      try {
        setIsLoading(true);
        setError(null);
        const lesson = lessonId ? parseInt(lessonId, 10) : 1;
        // Pass level to filter vocabulary by CEFR level
        const data = await fetchLessonWords(lesson, {
          level: level?.toUpperCase(),
        });
        setWords(data.words || []);
      } catch (err) {
        console.error("Failed to fetch vocabulary:", err);
        setError("Failed to load vocabulary. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadWords();
  }, [lessonId, level]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">
            Loading vocabulary...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No words found
  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
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
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <LessonHeader
          currentIndex={words.length - 1}
          total={words.length}
          onExit={() => navigate(-1)}
          words={words}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <CompletionScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <LessonHeader
        currentIndex={currentIndex}
        total={words.length}
        onExit={() => navigate(-1)}
        words={words}
      />

      <main className="flex-1 flex flex-col items-center justify-start pt-12 p-4 relative">
        <div className="w-full max-w-5xl relative">
          <FlashCard word={words[currentIndex]} />

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-16 z-20">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-110"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-16 z-20">
            <button
              onClick={handleNext}
              className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-110"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
