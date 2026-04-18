import { Suspense } from "react";
import SummariseAudioPage from "@/features/practice/pages/writing/SummariseAudioPage";

export default function PracticeSummarisePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" /></div>}>
      <SummariseAudioPage />
    </Suspense>
  );
}
