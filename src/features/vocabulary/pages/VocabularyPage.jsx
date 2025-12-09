import { Routes, Route, Navigate } from "react-router-dom";
import PageTabs from "@/components/ui/PageTabs";
import LearnContent from "../components/LearnContent";
import LevelBasedPage from "./LevelBasedPage";
import CEFRLevelPage from "./CEFRLevelPage";

// Placeholder content components
function ReviewContent() {
  return (
    <div className="text-gray-600 dark:text-slate-400">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Review
      </h2>
      <p>Review previously learned vocabulary with spaced repetition.</p>
    </div>
  );
}

function ActivitiesContent() {
  return (
    <div className="text-gray-600 dark:text-slate-400">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Activities
      </h2>
      <p>Practice vocabulary through fun games and activities.</p>
    </div>
  );
}

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

// Topics Placeholder Page
function TopicsPage() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Topical Vocabulary
      </h2>
      <p className="text-gray-500 dark:text-slate-400">
        Placeholder for topics vocabulary content.
      </p>
    </div>
  );
}

// Tab configuration
const vocabularyTabs = [
  {
    label: "Lessons",
    path: "lessons",
    subTabs: [
      { label: "Learn", path: "learn" },
      { label: "Review", path: "review" },
      { label: "Activities", path: "activities" },
    ],
  },
  {
    label: "Practice",
    path: "practice",
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
        <Route path="lessons/activities" element={<ActivitiesContent />} />
        <Route path="practice" element={<PracticeContent />} />

        {/* CEFR Level routes */}
        <Route path="cefr" element={<Navigate to="a1" replace />} />
        <Route path="cefr/:level" element={<CEFRLevelPage />} />

        {/* Level-Based route */}
        <Route path="level-based" element={<LevelBasedPage />} />

        {/* Topics route */}
        <Route path="topics" element={<TopicsPage />} />

        <Route path="*" element={<Navigate to="lessons/learn" replace />} />
      </Routes>
    </div>
  );
}
