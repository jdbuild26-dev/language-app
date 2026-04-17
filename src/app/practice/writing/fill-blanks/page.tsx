import { Suspense } from "react";
import WriteFillBlanksPage from "@/features/practice/pages/writing/WriteFillBlanksPage";

export default function PracticeWriteFillBlanksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" /></div>}>
      <WriteFillBlanksPage />
    </Suspense>
  );
}
