"use client";

import {
  BookOpen,
  Dumbbell,
  Languages,
  RotateCcw,
  Gamepad2,
} from "lucide-react";
import PageTabs from "@/components/ui/PageTabs";

const vocabularyTabs = [
  {
    label: "Lessons",
    path: "lessons",
    icon: BookOpen,
    subTabs: [
      { label: "Learn", path: "learn", icon: Languages },
      { label: "Review", path: "review", icon: RotateCcw },
      { label: "Activities", path: "activities", icon: Gamepad2 },
    ],
  },
  { label: "Practice", path: "practice", icon: Dumbbell },
];

export default function VocabularyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageTabs
        basePath="/vocabulary"
        defaultTab="lessons"
        defaultSubTab="learn"
        tabs={vocabularyTabs}
      />
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
