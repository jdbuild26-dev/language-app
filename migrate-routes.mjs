import fs from 'fs';
import path from 'path';

// Define route mappings from App.jsx React Router paths to Next.js App Router
const routeMap = [
  // Legal
  { dest: 'privacy-policy', srcFile: 'src/pages/legal/PrivacyPolicy.tsx' },
  { dest: 'refund-policy', srcFile: 'src/pages/legal/RefundPolicy.tsx' },
  { dest: 'terms-conditions', srcFile: 'src/pages/legal/TermsConditions.tsx' },
  
  // Auth & Onboarding
  { dest: 'sign-in/[[...sign-in]]', srcFile: 'src/features/auth/pages/SignInPage.tsx' },
  { dest: 'sign-up/[[...sign-up]]', srcFile: 'src/features/auth/pages/SignUpPage.tsx' },
  { dest: 'onboarding/teacher', srcFile: 'src/features/auth/pages/TeacherOnboardingPage.tsx' },
  { dest: 'onboarding/student', srcFile: 'src/features/auth/pages/StudentOnboardingPage.tsx' },
  { dest: 'onboarding/new-profile', srcFile: 'src/features/auth/pages/NewProfileOnboardingPage.tsx' },
  
  // Public Profile
  { dest: 'profile/[username]', srcFile: 'src/features/student-dashboard/pages/PublicProfilePage.tsx' },
  
  // Dashboard Framework
  { dest: 'dashboard', srcFile: 'src/features/student-dashboard/pages/ProfilePage.tsx', layout: 'src/features/student-dashboard/layout/StudentLayout.tsx' },
  { dest: 'dashboard/teachers', srcFile: 'src/features/student-dashboard/pages/MyTeachersPage.tsx' },
  { dest: 'dashboard/friends', srcFile: 'src/features/student-dashboard/pages/FriendsPage.tsx' },
  { dest: 'dashboard/assignments', srcFile: 'src/features/student-dashboard/pages/AssignmentsPage.tsx' },
  { dest: 'dashboard/progress', srcFile: 'src/features/student-dashboard/pages/StudentProgressPage.tsx' },
  { dest: 'dashboard/referral', srcFile: 'src/features/student-dashboard/pages/ReferralPage.tsx' },

  // Teacher Dashboard Framework
  { dest: 'teacher-dashboard', srcFile: 'src/features/teacher-dashboard/pages/OverviewPage.tsx', layout: 'src/features/teacher-dashboard/layout/TeacherLayout.tsx' },
  { dest: 'teacher-dashboard/students', srcFile: 'src/features/teacher-dashboard/pages/MyStudentsPage.tsx' },
  { dest: 'teacher-dashboard/classes', srcFile: 'src/features/teacher-dashboard/pages/ClassesPage.tsx' },
  { dest: 'teacher-dashboard/profile', srcFile: 'src/features/teacher-dashboard/pages/TeacherProfilePage.tsx' },
  { dest: 'teacher-dashboard/calendar', srcFile: 'src/features/teacher-dashboard/pages/CalendarPage.tsx' },
  { dest: 'teacher-dashboard/assignments', srcFile: 'src/features/teacher-dashboard/pages/AssignmentsPage.tsx' },
  { dest: 'teacher-dashboard/referral', srcFile: 'src/features/teacher-dashboard/pages/TeacherReferralPage.tsx' },
  
  // Vocabulary features
  { dest: 'vocabulary', srcFile: 'src/features/vocabulary/pages/VocabularyPage.tsx' },
  { dest: 'vocabulary/learn', srcFile: 'src/features/vocabulary/pages/SrsLearnPage.tsx' },
  { dest: 'vocabulary/flashcards/[level]/[category]', srcFile: 'src/features/vocabulary/pages/FlashcardsPage.tsx' },
  
  // Grammar features
  { dest: 'grammar', srcFile: 'src/features/grammar/pages/GrammarPage.tsx' },
  // Stories features
  { dest: 'stories', srcFile: 'src/features/stories/pages/StoriesPage.tsx' },
  { dest: 'stories/[storyId]', srcFile: 'src/features/stories/pages/StoryPlayerPage.tsx' },
  // Practice
  { dest: 'practice', srcFile: 'src/features/practice/pages/PracticePage.tsx' },
  { dest: 'practice/select-topic', srcFile: 'src/features/practice/pages/TagTopicSelectionPage.tsx' },
  { dest: 'practice/fill-in-blank', srcFile: 'src/features/vocabulary/pages/FillInBlankGamePage.tsx' },
  { dest: 'practice/correct-spelling', srcFile: 'src/features/vocabulary/pages/CorrectSpellingGamePage.tsx' },
  
  // Blogs
  { dest: 'blogs', srcFile: 'src/features/blogs/pages/BlogsPage.tsx' },
  // AI Practice
  { dest: 'ai-practice', srcFile: 'src/features/ai-practice/pages/AIPracticePage.tsx' },
  
  // Find Teacher
  { dest: 'find-teacher', srcFile: 'src/features/vocabulary/pages/FindTeacherPage.tsx' },
  
  // 404
  { dest: '404', srcFile: 'src/pages/NotFound.tsx' }
];

function generateAppRouter() {
  for (const route of routeMap) {
    const dirPath = path.join('src', 'app', route.dest);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Read the original file
    if (fs.existsSync(route.srcFile)) {
      let content = fs.readFileSync(route.srcFile, 'utf8');
      
      // Export default component naming for Next.js page.tsx
      // Need to adjust if the file exported something else as default,
      // but usually React Router pages export default function Component...

      // Also need to adjust absolute paths relative to `@/` because of deep nesting?
      // tsconfig `@/*` avoids deep nesting issues!
      
      const destFile = path.join(dirPath, 'page.tsx');
      fs.writeFileSync(destFile, content);
      
      // Move original to bak to avoid compiler conflicts or delete it later
      fs.renameSync(route.srcFile, route.srcFile + '.bak');
      console.log(`Migrated ${route.srcFile} -> ${destFile}`);
    } else {
      console.warn(`Source file missing: ${route.srcFile}`);
    }

    // Handle Layout if specified
    if (route.layout && fs.existsSync(route.layout)) {
      let layoutContent = fs.readFileSync(route.layout, 'utf8');
      
      // Replace <Outlet /> with {children}
      layoutContent = layoutContent.replace(/import\s+{\s*Outlet\s*}\s+from\s+["']react-router-dom["'];?/, '');
      layoutContent = layoutContent.replace(/<Outlet\s*\/?\s*>/g, '{children}');
      
      // Inject children prop into component
      layoutContent = layoutContent.replace(/export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*{/, 
        'export default function $1({ children }: { children: React.ReactNode }) {');
        
      const destLayout = path.join('src', 'app', route.dest.split('/')[0], 'layout.tsx');
      fs.writeFileSync(destLayout, layoutContent);
      fs.renameSync(route.layout, route.layout + '.bak');
      console.log(`Migrated Layout ${route.layout} -> ${destLayout}`);
    }
  }
}

generateAppRouter();
