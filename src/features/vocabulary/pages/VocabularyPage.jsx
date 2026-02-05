import { Routes, Route, Navigate } from "react-router-dom";
// Force refresh
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
import PracticeContent from "../components/PracticeContent";
import LevelBasedPage from "./LevelBasedPage";
import SrsLearnPage from "./SrsLearnPage"; // Replaces LessonLearnPage for SRS defaults
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
import TypingFillInBlankPage from "./TypingFillInBlankPage";
import MatchWordsActivityPage from "./MatchWordsActivityPage";
import CorrectSpellingPage from "./CorrectSpellingPage";
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

        {/* Practice Routes */}
        <Route path="practice" element={<PracticeContent />} />

        {/* Level wordlist page - shows categories for a level */}
        <Route path="lessons/learn/:level" element={<CEFRLevelPage />} />

        {/* Flashcard learning route - level + category */}
        <Route
          path="lessons/learn/:level/:category"
          element={<SrsLearnPage />}
        />

        {/* Level-Based route */}
        <Route path="lessons/learn/level-based" element={<LevelBasedPage />} />

        {/* Topics routes */}
        <Route path="lessons/learn/topics" element={<TopicsPage />} />
        <Route path="lessons/learn/topic/:topic" element={<SrsLearnPage />} />

        {/* Activity Routes */}
        <Route
          path="lessons/activities/flashcards"
          element={<FlashcardsSetupPage />}
        />
        <Route
          path="lessons/activities/flashcards/game"
          element={<FlashcardsActivityGamePage />}
        />
        <Route
          path="lessons/activities/typing-fill-blanks"
          element={<TypingFillInBlankPage />}
        />
        <Route
          path="lessons/activities/match-words"
          element={<MatchWordsActivityPage mode="text" />}
        />
        <Route
          path="lessons/activities/match-images"
          element={<MatchWordsActivityPage mode="image" />}
        />
        <Route
          path="lessons/activities/correct-spelling"
          element={<CorrectSpellingPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/vocabulary/lessons/learn" replace />}
        />
      </Routes>
    </div>
  );
}
