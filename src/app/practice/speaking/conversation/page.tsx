import { Suspense } from "react";
import SpeakingConversationPage from "@/features/practice/pages/speaking/SpeakingConversationPage";

export default function PracticeSpeakingConversationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" /></div>}>
      <SpeakingConversationPage />
    </Suspense>
  );
}
