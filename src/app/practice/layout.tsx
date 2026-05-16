import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
