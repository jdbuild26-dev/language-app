import { Routes, Route, Navigate } from "react-router-dom";
import { BookOpen, Target } from "lucide-react";
import PageTabs from "@/components/ui/PageTabs";
import GrammarNotesList from "./GrammarNotesList";
import GrammarPracticePage from "./GrammarPracticePage";
import GrammarNotePage from "./GrammarNotePage";

const grammarTabs = [
  {
    label: "Lessons",
    path: "lessons",
    icon: BookOpen,
  },
  {
    label: "Practice",
    path: "practice",
    icon: Target,
  },
];

const GrammarPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Grammar</h1>
      </header>

      <PageTabs basePath="/grammar" defaultTab="lessons" tabs={grammarTabs} />

      <div className="mt-6">
        <Routes>
          <Route path="lessons" element={<GrammarNotesList />} />
          <Route path="lessons/:noteId" element={<GrammarNotePage />} />
          <Route path="practice" element={<GrammarPracticePage />} />
          <Route path="*" element={<Navigate to="/grammar/lessons" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default GrammarPage;
