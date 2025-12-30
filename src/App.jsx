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
import Dashboard from "@/pages/Dashboard";
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
import GrammarPage from "@/features/grammar/pages/GrammarPage";
import StoriesPage from "@/features/stories/pages/StoriesPage";
import PracticePage from "@/features/practice/pages/PracticePage";
import BlogsPage from "@/features/blogs/pages/BlogsPage";
import AIPracticePage from "@/features/ai-practice/pages/AIPracticePage";
import ProgressReportPage from "@/features/progress-report/pages/ProgressReportPage";
import TeacherDashboard from "@/pages/TeacherDashboard";

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
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Learning Feature Routes (Protected) */}
          <Route
            path="vocabulary/*"
            element={
              <ProtectedRoute>
                <VocabularyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="grammar"
            element={
              <ProtectedRoute>
                <GrammarPage />
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
            path="progress-report"
            element={
              <ProtectedRoute>
                <ProgressReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher-dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
