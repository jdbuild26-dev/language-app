import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchVocabulary } from "@/services/vocabularyApi";
import GenderIdentifierGame from "../components/gender-identifier/GenderIdentifierGame";

export default function GenderIdentifierPage() {
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWords() {
      setIsLoading(true);
      try {
        const data = await fetchVocabulary({});
        let loadedWords = data?.words || data || [];

        // Filter out words that have a clear gender in forms
        loadedWords = loadedWords.filter((w) => {
          return (
            w.forms &&
            w.forms.some(
              (f) =>
                f.gender &&
                (f.gender.toLowerCase().includes("masculine") ||
                  f.gender.toLowerCase().includes("feminine")),
            )
          );
        });

        // Randomize and take up to 20 words
        loadedWords = loadedWords.sort(() => 0.5 - Math.random()).slice(0, 20);
        setWords(loadedWords);
      } catch (error) {
        console.error("Failed to load vocabulary for Gender Identifier", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadWords();
  }, []);

  const handleBack = () => navigate("/vocabulary/lessons/activities");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-500 mb-4">
          No gender-specific words found for this activity.
        </p>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-sky-500 font-bold shadow-sm hover:scale-105 transition-transform text-white rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
          Gender Identifier
        </h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      <div className="flex-1 flex flex-col items-center py-4 px-4 w-full h-full">
        <GenderIdentifierGame initialWords={words} onComplete={() => {}} />
      </div>
    </div>
  );
}
