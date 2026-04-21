"use client";

// This file is superseded by GrammarConceptsPage.tsx which uses the DB-backed API.
// Kept for reference only — no longer used in the app.

import { Loader2 } from "lucide-react";

const GrammarNotesList = () => {
  return (
    <div className="text-center py-12 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
      <p>This component is deprecated. Use GrammarConceptsPage instead.</p>
    </div>
  );
};

export default GrammarNotesList;
