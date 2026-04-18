import { Suspense } from "react";
import SpeakInteractivePage from "@/features/practice/pages/speaking/SpeakInteractivePage";

export default function PracticeSpeakInteractivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" /></div>}>
      <SpeakInteractivePage />
    </Suspense>
  );
}
