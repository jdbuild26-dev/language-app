import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, HelpCircle, Eye, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fetchVocabulary } from "@/services/vocabularyApi";
import { Button } from "@/components/ui/button";

const ACCENTS = ["é", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

export default function CorrectSpellingPage() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle, correct, incorrect
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const data = await fetchVocabulary();
      // Filter words that have a wrong spelling defined
      const spellingWords = data.words.filter(
        (w) => w.wrongSpelling && w.wrongSpelling.trim().length > 0,
      );

      if (spellingWords.length === 0) {
        setError("No spelling words found. Please check the database.");
      } else {
        // Shuffle
        setWords(spellingWords.sort(() => Math.random() - 0.5));
      }
    } catch (err) {
      setError("Failed to load vocabulary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentWord = words[currentIndex];

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetState();
    } else {
      // Game Over or Restart
      const confirmRestart = window.confirm("You finished all words! Restart?");
      if (confirmRestart) {
        setWords((prev) => [...prev].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        resetState();
      }
    }
  };

  const resetState = () => {
    setUserInput("");
    setStatus("idle");
    setShowHint(false);
  };

  const handleCheck = () => {
    if (!currentWord) return;

    // Normalize comparison (ignore case, simple trim)
    const normalize = (str) => str.trim().toLowerCase();

    // Check against all valid forms (masculine, feminine, etc.)
    // But usually the correction is for the main word or specific form.
    // The requirement says "retrieve from wrong spelling column... display... correct".
    // I assume the "User" targets the main French Word.
    // Let's assume acceptable answers are any of the forms' words.

    const validAnswers = currentWord.forms.map((f) => normalize(f.word));

    if (validAnswers.includes(normalize(userInput))) {
      setStatus("correct");
    } else {
      setStatus("incorrect");
    }
  };

  const handleHint = () => {
    if (!currentWord) return;
    // Show first half of the first valid form
    const target = currentWord.forms[0].word;
    const half = Math.ceil(target.length / 2);
    setUserInput(target.substring(0, half));
    setShowHint(true);
  };

  const handleReveal = () => {
    if (!currentWord) return;
    setUserInput(currentWord.forms[0].word);
    setStatus("idle"); // Just fill it, don't auto-permit 'correct' state for points maybe? Or allow it.
    // Let's allow checking after reveal
  };

  const handleKeyClick = (key) => {
    setUserInput((prev) => prev + key);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadWords} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (!currentWord) return null;

  // Get wrong spellings (split by comma if multiple)
  const wrongSpellings = currentWord.wrongSpelling
    ? currentWord.wrongSpelling.split(",").map((s) => s.trim())
    : [];

  // Display one random wrong spelling if multiple
  const displayWrong = wrongSpellings.length > 0 ? wrongSpellings[0] : "???"; // Should not happen given filter

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/vocabulary/lessons/activities"
          className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Activities
        </Link>
        <div className="text-sm font-medium text-slate-500">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Spell the word in French
        </h1>

        {/* Word Context */}
        <div className="space-y-2">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentWord.english}
          </div>
          {currentWord.forms[0]?.gender && (
            <span
              className={cn(
                "inline-block px-3 py-1 rounded-full text-sm font-medium",
                currentWord.forms[0].gender.includes("Masculine")
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                  : currentWord.forms[0].gender.includes("Feminine")
                    ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {currentWord.forms[0].gender}
            </span>
          )}
        </div>

        {/* Wrong Spelling Display */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 inline-block">
          <span className="text-sm text-red-500 dark:text-red-400 block mb-1 font-semibold uppercase tracking-wider">
            Incorrect
          </span>
          <span className="text-2xl font-mono text-red-700 dark:text-red-300 line-through decoration-red-500/50">
            {displayWrong}
          </span>
        </div>

        {/* Input Area */}
        <div className="max-w-xs mx-auto">
          <input
            type="text"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setStatus("idle");
            }}
            className={cn(
              "w-full text-center text-3xl font-bold p-4 rounded-xl border-2 outline-none transition-all",
              status === "correct"
                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : status === "incorrect"
                  ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500",
            )}
            placeholder="Type here..."
            autoFocus
          />
        </div>

        {/* Action Buttons: Accents */}
        <div className="flex flex-wrap justify-center gap-2">
          {ACCENTS.map((char) => (
            <button
              key={char}
              onClick={() => handleKeyClick(char)}
              className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Controls: Hint, Reveal */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleHint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            title="Reveal first half"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Hint</span>
          </button>
          <button
            onClick={handleReveal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Reveal answer"
          >
            <Eye className="w-5 h-5" />
            <span>Reveal</span>
          </button>
        </div>

        {/* Submit */}
        <div className="pt-4">
          {status === "correct" ? (
            <Button
              className="w-full h-14 text-xl bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
              onClick={handleNext}
            >
              Next Word <Check className="ml-2 w-6 h-6" />
            </Button>
          ) : (
            <Button
              className="w-full h-14 text-xl shadow-lg shadow-indigo-500/20"
              onClick={handleCheck}
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
