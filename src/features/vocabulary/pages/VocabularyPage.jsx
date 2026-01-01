import { Routes, Route, Navigate } from "react-router-dom";
import {
  BookOpen,
  Dumbbell,
  Languages,
  RotateCcw,
  Gamepad2,
} from "lucide-react";
import PageTabs from "@/components/ui/PageTabs";
import LearnContent from "../components/LearnContent";
import ReviewContent from "../components/ReviewContent";
import LevelBasedPage from "./LevelBasedPage";
import LessonLearnPage from "./LessonLearnPage";
import CEFRLevelPage from "./CEFRLevelPage";
import ReviewWordsPage from "./ReviewWordsPage";
import ReviewSessionPage from "./ReviewSessionPage";
import MyWordlistsPage from "./MyWordlistsPage";
import LearnedCardsSessionPage from "./LearnedCardsSessionPage";
import TopicsPage from "./TopicsPage";
import TopicCategoryPage from "./TopicCategoryPage";
import ActivitiesPage from "./ActivitiesPage";
import FlashcardsSetupPage from "./FlashcardsSetupPage";
import FlashcardsActivityGamePage from "./FlashcardsActivityGamePage";

// Placeholder content components

function PracticeContent() {
  return (
    <div className="text-gray-600 dark:text-slate-400">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Practice
      </h2>
      <p>Test your vocabulary skills with quizzes and challenges.</p>
    </div>
  );
}

// Tab configuration
const vocabularyTabs = [
  {
    label: "Lessons",
    path: "lessons",
    icon: BookOpen,
    subTabs: [
      { label: "Learn", path: "learn", icon: Languages },
      { label: "Review", path: "review", icon: RotateCcw },
      { label: "Activities", path: "activities", icon: Gamepad2 },
    ],
  },
  {
    label: "Practice",
    path: "practice",
    icon: Dumbbell,
    // Add subTabs if needed for unified layout
  },
];

export default function VocabularyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageTabs
        basePath="/vocabulary"
        defaultTab="lessons"
        defaultSubTab="learn"
        tabs={vocabularyTabs}
      />

      {/* Nested routes for tab content */}
      <Routes>
        <Route path="lessons/learn" element={<LearnContent />} />
        <Route path="lessons/review" element={<ReviewContent />} />
        <Route path="lessons/review/words" element={<ReviewWordsPage />} />
        <Route
          path="lessons/review/words/session"
          element={<ReviewSessionPage />}
        />
        <Route path="lessons/review/wordlists" element={<MyWordlistsPage />} />
        <Route
          path="lessons/review/wordlists/session"
          element={<LearnedCardsSessionPage />}
        />
        <Route path="lessons/activities" element={<ActivitiesPage />} />
        <Route path="practice" element={<PracticeContent />} />

        {/* Level wordlist page - shows categories for a level */}
        <Route path="lessons/learn/:level" element={<CEFRLevelPage />} />

        {/* Flashcard learning route - level + category */}
        <Route
          path="lessons/learn/:level/:category"
          element={<LessonLearnPage />}
        />

        {/* Level-Based route */}
        <Route path="lessons/learn/level-based" element={<LevelBasedPage />} />

        {/* Topics routes */}
        <Route path="lessons/learn/topics" element={<TopicsPage />} />
        <Route
          path="lessons/learn/topic/:topic"
          element={<LessonLearnPage />}
        />

        {/* Activity Routes */}
        <Route
          path="lessons/activities/flashcards"
          element={<FlashcardsSetupPage />}
        />
        <Route
          path="lessons/activities/flashcards/game"
          element={<FlashcardsActivityGamePage />}
        />

        <Route path="*" element={<Navigate to="lessons/learn" replace />} />
      </Routes>
    </div>
  );
}
