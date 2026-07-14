"use client";

import { usePathname } from "next/navigation";
import { BookOpen, Target } from "lucide-react";
import PageTabs from "@/components/ui/PageTabs";

const grammarTabs = [
  { label: "Lessons", path: "lessons", icon: BookOpen },
  { label: "Practice", path: "practice", icon: Target },
];

export default function GrammarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isLessonDetail = /^\/grammar\/lessons\/[^/]+/.test(pathname);
  const isPracticeExercise = /^\/grammar\/practice\/[^/]+/.test(pathname);

  if (isLessonDetail || isPracticeExercise) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Grammar</h1>
      </header>
      <PageTabs basePath="/grammar" defaultTab="lessons" tabs={grammarTabs} />
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
