import { Suspense } from "react";
import WritingConversationPage from "@/features/practice/pages/writing/WritingConversationPage";

export default function PracticeWritingConversationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" /></div>}>
      <WritingConversationPage />
    </Suspense>
  );
}
