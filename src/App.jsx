import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

// Pages
import Home from "@/pages/Home";

import NotFound from "@/pages/NotFound";

// Legal pages
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import RefundPolicy from "@/pages/legal/RefundPolicy";
import TermsConditions from "@/pages/legal/TermsConditions";

// Auth feature
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/auth/pages/SignUpPage";

// Learning features
import VocabularyPage from "@/features/vocabulary/pages/VocabularyPage";
import FlashcardsPage from "@/features/vocabulary/pages/FlashcardsPage";
import GrammarPage from "@/features/grammar/pages/GrammarPage";
import GrammarNotePage from "@/features/grammar/pages/GrammarNotePage";
import StoriesPage from "@/features/stories/pages/StoriesPage";
import PracticePage from "@/features/practice/pages/PracticePage";
import FillInBlankGamePage from "@/features/vocabulary/pages/FillInBlankGamePage";
import CorrectSpellingGamePage from "@/features/vocabulary/pages/CorrectSpellingGamePage";
import BlogsPage from "@/features/blogs/pages/BlogsPage";
import AIPracticePage from "@/features/ai-practice/pages/AIPracticePage";
import ProgressReportPage from "@/features/progress-report/pages/ProgressReportPage";
import FindTeacherPage from "@/features/vocabulary/pages/FindTeacherPage";
import TeacherLayout from "@/features/teacher-dashboard/layout/TeacherLayout";
import OverviewPage from "@/features/teacher-dashboard/pages/OverviewPage";
import MyStudentsPage from "@/features/teacher-dashboard/pages/MyStudentsPage";
import ClassesPage from "@/features/teacher-dashboard/pages/ClassesPage";

// Practice Games
import MatchPairsGamePage from "@/features/vocabulary/pages/MatchPairsGamePage";
import MatchPairsB1GamePage from "@/features/vocabulary/pages/MatchPairsB1GamePage";
import ChooseOptionGamePage from "@/features/vocabulary/pages/ChooseOptionGamePage";
import HighlightWordGamePage from "@/features/vocabulary/pages/HighlightWordGamePage";
import OddOneOutGamePage from "@/features/vocabulary/pages/OddOneOutGamePage";
import GroupWordsGamePage from "@/features/vocabulary/pages/GroupWordsGamePage";

// Listening Practice Pages
import PhoneticsPage from "@/features/vocabulary/pages/listening/PhoneticsPage";
import MultiSelectPage from "@/features/vocabulary/pages/listening/MultiSelectPage";
import AudioToAudioPage from "@/features/vocabulary/pages/listening/AudioToAudioPage";
import AudioFillBlankPage from "@/features/vocabulary/pages/listening/AudioFillBlankPage";
import DictationPage from "@/features/vocabulary/pages/listening/DictationPage";

// Full Screen Layout
import FullScreenLayout from "@/components/layout/FullScreenLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sign-in/*" element={<SignInPage />} />
          <Route path="sign-up/*" element={<SignUpPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="terms-conditions" element={<TermsConditions />} />

          {/* Protected routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <ProgressReportPage />
              </ProtectedRoute>
            }
          />

          {/* Learning Feature Routes (Protected) */}
          <Route
            path="vocabulary/flashcards/:level/:category"
            element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="vocabulary/*"
            element={
              <ProtectedRoute>
                <VocabularyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="grammar/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route index element={<GrammarPage />} />
                  <Route path=":noteId" element={<GrammarNotePage />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          <Route
            path="stories"
            element={
              <ProtectedRoute>
                <StoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="practice"
            element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="practice/fill-in-blank"
            element={
              <ProtectedRoute>
                <FillInBlankGamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="practice/correct-spelling"
            element={
              <ProtectedRoute>
                <CorrectSpellingGamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="blogs"
            element={
              <ProtectedRoute>
                <BlogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ai-practice/*"
            element={
              <ProtectedRoute>
                <AIPracticePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="find-teacher"
            element={
              <ProtectedRoute>
                <FindTeacherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher-dashboard"
            element={
              <ProtectedRoute>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="students" element={<MyStudentsPage />} />
            <Route path="classes" element={<ClassesPage />} />
          </Route>

          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>

        {/* Full Screen Practice Routes (Outside Main Layout) */}
        <Route
          path="/vocabulary/practice/match-pairs"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <MatchPairsGamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/match-pairs-b1"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <MatchPairsB1GamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/choose-options"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ChooseOptionGamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/highlight-word"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <HighlightWordGamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/odd-one-out"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <OddOneOutGamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/group-words"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <GroupWordsGamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/fill-in-blank"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <FillInBlankGamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/correct-spelling"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <CorrectSpellingGamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        {/* Listening Practice Routes */}
        <Route
          path="/vocabulary/practice/listening/match-pairs"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <MatchPairsB1GamePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/listening/phonetics"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <PhoneticsPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/listening/multi-select"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <MultiSelectPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/listening/audio-match"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <AudioToAudioPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/listening/fill-in-blank"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <AudioFillBlankPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/listening/dictation"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <DictationPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
