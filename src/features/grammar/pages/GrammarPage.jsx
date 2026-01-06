import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BookOpen, Dumbbell } from "lucide-react";
import PageTabs from "@/components/ui/PageTabs";
import GrammarNotesPage from "./GrammarNotesPage";
import GrammarPracticePage from "./GrammarPracticePage";

const grammarTabs = [
  {
    label: "Notes",
    path: "notes",
    icon: BookOpen,
  },
  {
    label: "Practice",
    path: "practice",
    icon: Dumbbell,
  },
];

export default function GrammarPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageTabs basePath="/grammar" defaultTab="notes" tabs={grammarTabs} />

      <Routes>
        <Route path="notes" element={<GrammarNotesPage />} />
        <Route path="practice" element={<GrammarPracticePage />} />
        <Route path="*" element={<Navigate to="notes" replace />} />
      </Routes>
    </div>
  );
}
