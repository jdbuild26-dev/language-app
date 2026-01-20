import { Routes, Route, Navigate } from "react-router-dom";

// Stories Components
import StoriesLearnContent from "../components/StoriesLearnContent";
import StoriesLevelPage from "./StoriesLevelPage";
import StoriesByLevelPage from "./StoriesByLevelPage";
import StoriesThemesPage from "./StoriesThemesPage";
import StoriesByThemePage from "./StoriesByThemePage";
import StoriesGrammarPage from "./StoriesGrammarPage";
import StoriesByGrammarPage from "./StoriesByGrammarPage";

export default function StoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Nested routes for stories content */}
      <Routes>
        {/* Main learn page with carousels */}
        <Route index element={<StoriesLearnContent />} />
        <Route path="learn" element={<StoriesLearnContent />} />

        {/* By Level routes */}
        <Route path="learn/by-level" element={<StoriesLevelPage />} />
        <Route path="learn/by-level/:level" element={<StoriesByLevelPage />} />

        {/* By Theme routes */}
        <Route path="learn/by-theme" element={<StoriesThemesPage />} />
        <Route path="learn/by-theme/:theme" element={<StoriesByThemePage />} />

        {/* By Grammar routes */}
        <Route path="learn/by-grammar" element={<StoriesGrammarPage />} />
        <Route
          path="learn/by-grammar/:topic"
          element={<StoriesByGrammarPage />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/stories" replace />} />
      </Routes>
    </div>
  );
}
