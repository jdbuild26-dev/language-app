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
import SrsLearnPage from "@/features/vocabulary/pages/SrsLearnPage";
import GrammarPage from "@/features/grammar/pages/GrammarPage";
import GrammarNotePage from "@/features/grammar/pages/GrammarNotePage";
import StoriesPage from "@/features/stories/pages/StoriesPage";
import StoryPlayerPage from "@/features/stories/pages/StoryPlayerPage";
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
import IsThisFrenchWordPage from "@/features/vocabulary/pages/IsThisFrenchWordPage";

// Listening Practice Pages
import PhoneticsPage from "@/features/vocabulary/pages/listening/PhoneticsPage";
import MultiSelectPage from "@/features/vocabulary/pages/listening/MultiSelectPage";
import AudioToAudioPage from "@/features/vocabulary/pages/listening/AudioToAudioPage";
import AudioFillBlankPage from "@/features/vocabulary/pages/listening/AudioFillBlankPage";
import DictationPage from "@/features/vocabulary/pages/listening/DictationPage";

// Full Screen Layout
import FullScreenLayout from "@/components/layout/FullScreenLayout";
import RepeatWordPage from "@/features/practice/pages/RepeatWordPage";
import RepeatSentencePage from "@/features/practice/pages/RepeatSentencePage";
import WhatDoYouSeePage from "@/features/practice/pages/WhatDoYouSeePage";
import DictationImagePage from "@/features/practice/pages/DictationImagePage";

// Practice Module Reading Exercises
import MatchPairsPage from "@/features/practice/pages/reading/MatchPairsPage";
import BubbleSelectionPage from "@/features/practice/pages/reading/BubbleSelectionPage";
import HighlightPage from "@/features/practice/pages/reading/HighlightPage";
import HighlightTextPage from "@/features/practice/pages/reading/HighlightTextPage";
import ImageMCQPage from "@/features/practice/pages/reading/ImageMCQPage";
import ComprehensionPage from "@/features/practice/pages/reading/ComprehensionPage";
import CompletePassagePage from "@/features/practice/pages/reading/CompletePassagePage";
import ReorderPage from "@/features/practice/pages/reading/ReorderPage";
import TrueFalsePage from "@/features/practice/pages/reading/TrueFalsePage";
import ConversationPage from "@/features/practice/pages/reading/ConversationPage";
import DiagramLabellingPage from "@/features/practice/pages/reading/DiagramLabellingPage";

// Practice Module Listening Exercises
import ListenSelectPage from "@/features/practice/pages/listening/ListenSelectPage";
import ListenTypePage from "@/features/practice/pages/listening/ListenTypePage";
import ListenFillBlanksPage from "@/features/practice/pages/listening/ListenFillBlanksPage";

import ListenOrderPage from "@/features/practice/pages/listening/ListenOrderPage";
import ListenPassagePage from "@/features/practice/pages/listening/ListenPassagePage";
import ListenInteractivePage from "@/features/practice/pages/listening/ListenInteractivePage";
import ListeningComprehensionPage from "@/features/practice/pages/listening/ListeningComprehensionPage";
import ListeningConversationPage from "@/features/practice/pages/listening/ListeningConversationPage";

// Practice Module Writing Exercises
import TranslateTypedPage from "@/features/practice/pages/writing/TranslateTypedPage";
import SpellingPage from "@/features/practice/pages/writing/SpellingPage";
import WriteFillBlanksPage from "@/features/practice/pages/writing/WriteFillBlanksPage";
import WriteTopicPage from "@/features/practice/pages/writing/WriteTopicPage";
import WriteImagePage from "@/features/practice/pages/writing/WriteImagePage";
import WriteDocumentsPage from "@/features/practice/pages/writing/WriteDocumentsPage";
import WriteFormPage from "@/features/practice/pages/writing/WriteFormPage";
import WriteInteractivePage from "@/features/practice/pages/writing/WriteInteractivePage";

// Practice Module Speaking Exercises
import SpeakTranslatePage from "@/features/practice/pages/speaking/SpeakTranslatePage";
import SpeakTopicPage from "@/features/practice/pages/speaking/SpeakTopicPage";
import SpeakImagePage from "@/features/practice/pages/speaking/SpeakImagePage";
import SpeakInteractivePage from "@/features/practice/pages/speaking/SpeakInteractivePage";

import MatchDescToImagePage from "@/features/practice/pages/reading/MatchDescToImagePage";
import ImageLabellingPage from "@/features/practice/pages/reading/ImageLabellingPage";
import SentenceCompletionPage from "@/features/practice/pages/reading/SentenceCompletionPage";

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
            path="vocabulary/learn"
            element={
              <ProtectedRoute>
                <SrsLearnPage />
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
            path="stories/*"
            element={
              <ProtectedRoute>
                <StoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stories/:storyId"
            element={
              <ProtectedRoute>
                <StoryPlayerPage />
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

        <Route
          path="/vocabulary/practice/is-french-word"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <IsThisFrenchWordPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/reading/diagram-labelling"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <DiagramLabellingPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vocabulary/practice/reading/diagram-labelling"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <DiagramLabellingPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/match-desc-to-image"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <MatchDescToImagePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/image-labelling"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ImageLabellingPage />
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

        {/* Practice Module Routes - READING */}
        <Route
          path="/practice/reading/match-pairs"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <MatchPairsPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/bubble-selection"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <BubbleSelectionPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/highlight"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <HighlightPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/highlight-text"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <HighlightTextPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/image-mcq"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ImageMCQPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/comprehension"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ComprehensionPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/fill-blanks-passage"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <CompletePassagePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/reorder"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ReorderPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/true-false"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <TrueFalsePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/conversation"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ConversationPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/diagram-labelling"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <DiagramLabellingPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/reading/complete-passage"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <SentenceCompletionPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        {/* Practice Module Routes - LISTENING */}
        <Route
          path="/practice/listening/select"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListenSelectPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/listening/type"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListenTypePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/listening/fill-blanks"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListenFillBlanksPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice/listening/order"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListenOrderPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/listening/passage"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListenPassagePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/listening/interactive"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListenInteractivePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice/listening/comprehension"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListeningComprehensionPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/listening/conversation"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <ListeningConversationPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        {/* Practice Module Routes - WRITING */}
        <Route
          path="/practice/writing/translate"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <TranslateTypedPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/writing/spelling"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <SpellingPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/writing/fill-blanks"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <WriteFillBlanksPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/writing/topic"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <WriteTopicPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/writing/image"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <WriteImagePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/writing/documents"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <WriteDocumentsPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/writing/form"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <WriteFormPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/writing/interactive"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <WriteInteractivePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        {/* Practice Module Routes - SPEAKING */}
        <Route
          path="/practice/speaking/translate"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <SpeakTranslatePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/speaking/topic"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <SpeakTopicPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/speaking/image"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <SpeakImagePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/speaking/interactive"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <SpeakInteractivePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />

        {/* Speaking Practice Routes */}
        <Route
          path="/vocabulary/practice/repeat-word"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <RepeatWordPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/repeat-sentence"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <RepeatSentencePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/repeat-word"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <RepeatWordPage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/what-do-you-see"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <WhatDoYouSeePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary/practice/dictation-image"
          element={
            <ProtectedRoute>
              <FullScreenLayout>
                <DictationImagePage />
              </FullScreenLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
