import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import SegmentedInput from "../components/ui/SegmentedInput";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import AccentKeyboard from "@/components/ui/AccentKeyboard";

// Using local storage to keep track of consecutive correct spellings
const getSrsProgress = (word) => {
  try {
    const progress = JSON.parse(
      localStorage.getItem("srs_spelling_progress") || "{}",
    );
    return progress[word] || 0;
  } catch (e) {
    return 0;
  }
};

const incrementSrsProgress = (word) => {
  try {
    const progress = JSON.parse(
      localStorage.getItem("srs_spelling_progress") || "{}",
    );
    progress[word] = (progress[word] || 0) + 1;
    localStorage.setItem("srs_spelling_progress", JSON.stringify(progress));
  } catch (e) {
    console.error("Error saving SRS progress", e);
  }
};

const resetSrsProgress = (word) => {
  try {
    const progress = JSON.parse(
      localStorage.getItem("srs_spelling_progress") || "{}",
    );
    progress[word] = 0;
    localStorage.setItem("srs_spelling_progress", JSON.stringify(progress));
  } catch (e) {
    console.error("Error resetting SRS progress", e);
  }
};

// Generate hints based on SRS progress
// level 0: First time (e.g. Bib _ _ _ t h _ _ _ e)
// level 1: Second time (e.g. B _ _ _ I _ _ _ q _ _ e)
// level 2: Third time (e.g. B _ _ _ _ _ e or B _ _ _ _ _ _ _ _)
const generateHints = (word, srsLevel) => {
  const chars = word.split("");
  const hintIndices = [];

  if (srsLevel === 0) {
    // Show first, last, and ~30% of middle characters
    if (chars.length > 0) hintIndices.push(0);
    if (chars.length > 1) hintIndices.push(chars.length - 1);

    // Add first few letters if it's a long word (like bibliothèque -> Bib)
    if (chars.length > 5) {
      hintIndices.push(1);
      hintIndices.push(2);
    }

    // Add some middle letters, roughly every 3rd or 4th character
    for (let i = 3; i < chars.length - 2; i += 3) {
      hintIndices.push(i);
    }
  } else if (srsLevel === 1) {
    // Show first, last, and ~15% of middle characters
    if (chars.length > 0) hintIndices.push(0);
    if (chars.length > 1) hintIndices.push(chars.length - 1);

    // Add one or two sparse middle letters
    if (chars.length > 6) {
      hintIndices.push(Math.floor(chars.length / 2));
    }
  } else {
    // Show only first character, and optionally last character if word is long
    if (chars.length > 0) hintIndices.push(0);
    if (chars.length > 4) hintIndices.push(chars.length - 1);
  }

  // Deduplicate and sort
  return [...new Set(hintIndices)].sort((a, b) => a - b);
};

export default function SrsSpellingActivityPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]);
  const [currentHints, setCurrentHints] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // Accent keyboard focus tracking
  const [focusedIndex, setFocusedIndex] = useState(null);

  // Timer Hook
  const currentQuestion = questions[currentIndex];
  // Giving slightly more time for spelling from memory
  const timerDuration = parseInt(currentQuestion?.timeLimit) || 120;

  // Ref for input fields
  const inputsRef = useRef([]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
        // Reset progress on timeout (treated as incorrect)
        if (currentQuestion?.correctAnswer) {
          resetSrsProgress(
            cleanString(currentQuestion.correctAnswer).toLowerCase(),
          );
        }
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  // Clean string helper
  const cleanString = (str) => {
    if (!str) return "";
    return str
      .trim()
      .replace(/\u200B/g, "") // Remove zero-width space
      .normalize("NFC"); // Normalize unicode
  };

  // Reset logic for new question
  useEffect(() => {
    if (questions.length > 0 && !isCompleted && currentQuestion) {
      resetTimer();

      const rawAnswer = currentQuestion?.correctAnswer || "";
      const answer = cleanString(rawAnswer);
      const answerLower = answer.toLowerCase();

      const srsLevel = getSrsProgress(answerLower);
      const hints = generateHints(answer, srsLevel);
      setCurrentHints(hints);

      // Initialize inputs: pre-fill hints, empty otherwise
      const initialInputs = answer
        .split("")
        .map((char, idx) => (hints.includes(idx) ? char : ""));

      setUserInputs(initialInputs);

      // Focus first empty input
      setTimeout(() => {
        const firstEmptyIdx = initialInputs.findIndex((val) => val === "");
        if (firstEmptyIdx !== -1 && inputsRef.current[firstEmptyIdx]) {
          inputsRef.current[firstEmptyIdx].focus();
        } else if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [currentIndex, questions, isCompleted, resetTimer, currentQuestion]);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      // Using mock data as requested
      const mockData = [
        {
          id: 1,
          correctAnswer: "chocolat",
          instructionEn: "Spell the word",
          wordMeaningEn: "Chocolate",
          imageUrl:
            "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=400&auto=format&fit=crop",
          timeLimit: 120,
        },
        {
          id: 2,
          correctAnswer: "bibliothèque",
          instructionEn: "Spell the word",
          wordMeaningEn: "Library",
          imageUrl:
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop",
          timeLimit: 120,
        },
        {
          id: 3,
          correctAnswer: "ordinateur",
          instructionEn: "Spell the word",
          wordMeaningEn: "Computer",
          imageUrl:
            "https://images.unsplash.com/photo-1517336714731-48968ffd1cb0?q=80&w=400&auto=format&fit=crop",
          timeLimit: 120,
        },
        {
          id: 4,
          correctAnswer: "restaurant",
          instructionEn: "Spell the word",
          wordMeaningEn: "Restaurant",
          imageUrl:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop",
          timeLimit: 120,
        },
        {
          id: 5,
          correctAnswer: "boulangerie",
          instructionEn: "Spell the word",
          wordMeaningEn: "Bakery",
          imageUrl:
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop",
          timeLimit: 120,
        },
      ];

      const response = { data: mockData };

      if (response && response.data && response.data.length > 0) {
        const normalized = response.data.map((item) => ({
          id: item.ExerciseID || Math.random(),
          correctAnswer:
            item.correctText ||
            item.correct ||
            item.CorrectAnswer_FR ||
            item["Correct Answer"] ||
            item.Answer ||
            item.Correct ||
            item["Correct Word"] ||
            item.correctAnswer ||
            "",
          instructionFr: item.Instruction_FR || "Épelez le mot",
          instructionEn: item.Instruction_EN || "Spell the word",
          timeLimit: item.TimeLimitSeconds || item["Time Limit"] || 120,
          wordMeaningEn:
            item.englishTranslation ||
            item.wordMeaning ||
            item["Word Meaning_EN"] ||
            item["Word Meaning"] ||
            item.Question_EN ||
            item.Prompt ||
            item.Meaning ||
            item.Translation ||
            "",
          imageUrl: item.Image || item.imageUrl || "/placeholder-image.png",
        }));

        // Filter out items without a valid answer
        const validQuestions = normalized.filter(
          (q) => q.correctAnswer && q.correctAnswer.trim().length > 0,
        );

        if (validQuestions.length > 0) {
          // Let's randomize to make it feel fresh
          const shuffled = [...validQuestions].sort(() => 0.5 - Math.random());
          setQuestions(shuffled.slice(0, 10)); // Take 10 questions for a session
        } else {
          setQuestions([]);
        }
      } else {
        console.error("[SrsSpelling] ❌ API returned empty data");
        setQuestions([]);
      }
    } catch (err) {
      console.error("[SrsSpelling] ❌ Failed to load:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (showFeedback || currentHints.includes(index)) return;

    // Check for deletion
    if (value === "") {
      const newInputs = [...userInputs];
      newInputs[index] = "";
      setUserInputs(newInputs);
      return;
    }

    const char = value.slice(-1); // Keep last char
    const newInputs = [...userInputs];
    newInputs[index] = char;
    setUserInputs(newInputs);

    // Find next empty or non-hint input to focus
    let nextIndex = index + 1;
    while (nextIndex < newInputs.length && currentHints.includes(nextIndex)) {
      nextIndex++;
    }

    if (nextIndex < newInputs.length && inputsRef.current[nextIndex]) {
      inputsRef.current[nextIndex].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (showFeedback) return;

    if (e.key === "Backspace") {
      if (userInputs[index] === "" && index > 0) {
        // Find previous non-hint input
        let prevIndex = index - 1;
        while (prevIndex >= 0 && currentHints.includes(prevIndex)) {
          prevIndex--;
        }
        if (prevIndex >= 0 && inputsRef.current[prevIndex]) {
          inputsRef.current[prevIndex].focus();
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      let prevIndex = index - 1;
      while (prevIndex >= 0 && currentHints.includes(prevIndex)) {
        prevIndex--;
      }
      if (prevIndex >= 0 && inputsRef.current[prevIndex]) {
        inputsRef.current[prevIndex].focus();
      }
    } else if (e.key === "ArrowRight" && index < userInputs.length - 1) {
      let nextIndex = index + 1;
      while (
        nextIndex < userInputs.length &&
        currentHints.includes(nextIndex)
      ) {
        nextIndex++;
      }
      if (nextIndex < userInputs.length && inputsRef.current[nextIndex]) {
        inputsRef.current[nextIndex].focus();
      }
    } else if (e.key === "Enter") {
      if (userInputs.every((i) => i !== "")) {
        handleSubmit();
      }
    }
  };

  const handlePaste = (index, e) => {
    if (showFeedback || currentHints.includes(index)) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!pastedData) return;

    const chars = pastedData.split("");
    const newInputs = [...userInputs];

    let filledCount = 0;
    let charIdx = 0;

    // Fill starting from the focused index, skipping hints
    for (let i = index; i < newInputs.length && charIdx < chars.length; i++) {
      if (!currentHints.includes(i)) {
        newInputs[i] = chars[charIdx];
        charIdx++;
        filledCount = i; // keep track of last filled position
      }
    }

    setUserInputs(newInputs);

    // Focus next available
    let nextIndex = filledCount + 1;
    while (nextIndex < newInputs.length && currentHints.includes(nextIndex)) {
      nextIndex++;
    }

    if (nextIndex < newInputs.length && inputsRef.current[nextIndex]) {
      inputsRef.current[nextIndex].focus();
    } else if (inputsRef.current[filledCount]) {
      inputsRef.current[filledCount].focus();
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const userAnswer = userInputs.join("");
    const rightAnswer = currentQuestion?.correctAnswer
      ? currentQuestion.correctAnswer
          .trim()
          .replace(/\u200B/g, "")
          .normalize("NFC")
      : "";

    const correct = userAnswer.toLowerCase() === rightAnswer.toLowerCase();

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    const answerLower = rightAnswer.toLowerCase();
    if (correct) {
      setScore((prev) => prev + 1);
      incrementSrsProgress(answerLower);
    } else {
      resetSrsProgress(answerLower);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Progress
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            No content available
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Could not load spelling vocabulary. Please try again later.
          </p>
          <button
            onClick={() => navigate("/vocabulary")}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Targeted Spelling (SRS)"
        instructionFr={currentQuestion?.instructionFr || "Épelez le mot"}
        instructionEn={currentQuestion?.instructionEn || "Spell the word"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          (userInputs.every((i) => i !== "") && !showFeedback) || showFeedback
        }
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-4xl pt-4">
          {/* Image & Context display */}
          <div className="flex flex-col items-center mb-10 w-full max-w-md">
            {currentQuestion?.imageUrl &&
              currentQuestion.imageUrl !== "/placeholder-image.png" && (
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800 mb-6 relative bg-slate-100 dark:bg-slate-800">
                  <img
                    src={currentQuestion.imageUrl}
                    alt={currentQuestion.wordMeaningEn || "Vocabulary image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center text-slate-400">No Image</div>';
                    }}
                  />
                </div>
              )}

            {currentQuestion?.wordMeaningEn && (
              <h3 className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200 text-center tracking-wide">
                {currentQuestion.wordMeaningEn}
              </h3>
            )}

            {/* SRS Level Indicator (Optional, could be hidden in prod) */}
            <div className="mt-2 text-xs font-semibold text-sky-500 bg-sky-50 dark:bg-sky-900/30 px-3 py-1 rounded-full border border-sky-100 dark:border-sky-800">
              Mastery Level:{" "}
              {Math.min(
                3,
                getSrsProgress(
                  cleanString(
                    currentQuestion?.correctAnswer || "",
                  ).toLowerCase(),
                ) + 1,
              )}
            </div>
          </div>

          {/* Input Boxes */}
          <div className="flex flex-nowrap justify-center gap-1 md:gap-2 mb-4 max-w-full overflow-x-auto pb-4 px-2 scrollbar-hide">
            <SegmentedInput
              values={userInputs}
              onChange={(idx, val) => handleInputChange(idx, val)}
              onKeyDown={(idx, e) => handleKeyDown(idx, e)}
              onPaste={(idx, e) => handlePaste(idx, e)}
              onFocus={(idx) => setFocusedIndex(idx)}
              disabled={showFeedback}
              hints={currentHints}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              inputRefs={inputsRef}
            />
          </div>

          {/* Accent Keyboard */}
          {!showFeedback && (
            <AccentKeyboard
              disabled={showFeedback}
              onAccentClick={(char) => {
                const idx =
                  focusedIndex ?? userInputs.findIndex((v) => v === "");
                if (idx === -1 || idx === null) return;
                handleInputChange(idx, char);
                requestAnimationFrame(() => {
                  inputsRef.current[idx]?.focus();
                });
              }}
            />
          )}
        </div>
      </PracticeGameLayout>
    </>
  );
}
