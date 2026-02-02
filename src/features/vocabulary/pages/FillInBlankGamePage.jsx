import React, { useState, useEffect, useMemo } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function FillInBlankGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]); // Array of selected words
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // Timer Hook
  const currentQuestion = questions[currentIndex];
  // Calculate duration securely
  const timerDuration = parseInt(currentQuestion?.TimeLimitSeconds) || 60;

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        // Time's up logic
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  // Reset logic when question changes
  useEffect(() => {
    if (questions.length > 0 && !isCompleted && currentQuestion) {
      resetTimer();

      // Determine number of blanks
      // Assuming '______' denotes a blank.
      // If we don't find it, we assume 1 blank at end or relevant pos.
      const sentenceParts = currentQuestion.SentenceWithBlank?.split("______");
      const blankCount =
        sentenceParts && sentenceParts.length > 1
          ? sentenceParts.length - 1
          : 1;

      // Initialize inputs with empty strings
      setUserInputs(new Array(blankCount).fill(""));
      setShowFeedback(false);
      setIsCorrect(false);
      setFeedbackMessage("");
    }
  }, [currentIndex, questions, isCompleted, resetTimer, currentQuestion]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("C1_Writing_FITB");
      if (response && response.data) {
        setQuestions(response.data);
      }
    } catch (err) {
      console.error("Failed to load practice questions:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  // Generate options (Distractors + Correct Answer)
  const options = useMemo(() => {
    if (!currentQuestion || questions.length === 0) return [];

    // Safety check: ensure we have distractors
    const allAnswers = questions
      .map((q) => (q.CorrectAnswer ? q.CorrectAnswer.trim() : ""))
      .filter((a) => a && a !== currentQuestion.CorrectAnswer?.trim());

    // Shuffle and pick 3 distractors
    const distractors = allAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);

    // Add correct answer
    const currentAnswer = currentQuestion.CorrectAnswer?.trim() || "";
    // If not enough distractors from other questions, add some dummies (if absolute fallback needed, but usually we have questions)
    // For now we assume we have questions.

    const mixedOptions = [...distractors, currentAnswer];

    // Remove duplicates
    const uniqueOptions = [...new Set(mixedOptions)];

    // Shuffle final options
    return uniqueOptions.sort(() => 0.5 - Math.random());
  }, [currentQuestion, questions]);

  const handleSelectChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const correctAns = currentQuestion.CorrectAnswer.trim();
    // Assuming single answer string for now as per data structure

    const userAnswer = userInputs.join("");
    const correct = userAnswer.toLowerCase() === correctAns.toLowerCase();

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Progress percentage
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  // Parse sentence parts
  const sentenceParts = currentQuestion?.SentenceWithBlank?.split("______") || [
    "",
    "",
  ];
  // If no split happened (no ______ found), treat as [text, ""] effectively putting blank at end if we forced blankCount=1?
  // Code in useEffect ensures blankKey count matches logic here if we are consistent.
  // Actually, if split returns 1 element (no separator), we still need to show a blank?
  // Current logic: split('______'). If length==1, NO blank in text.
  // But we force blankCount=1 in useEffect.
  // Let's handle this case in rendering: if sentenceParts.length === 1, we append a [1] at end.
  const displayParts =
    sentenceParts.length === 1 ? [sentenceParts[0], ""] : sentenceParts;

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the blanks - Passage"
        instructionFr={currentQuestion?.Instruction_FR || "Complétez la phrase"}
        instructionEn={
          currentQuestion?.Instruction_EN ||
          "Select the best option for each missing word"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
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
        correctAnswer={!isCorrect ? currentQuestion.CorrectAnswer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* LEFT COLUMN: PASSAGE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col min-h-[400px]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Passage
              </h3>

              <div className="text-lg leading-loose text-slate-800 font-medium">
                {displayParts.map((part, idx) => (
                  <React.Fragment key={idx}>
                    <span>{part}</span>
                    {idx < displayParts.length - 1 && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-slate-300 bg-slate-50 text-slate-500 text-sm font-bold mx-2 align-middle select-none">
                        {idx + 1}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: OPTIONS */}
            <div className="flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex-1 min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-900 mb-6">
                  Select the best option for each missing word
                </h3>

                <div className="space-y-4">
                  {/* Render a select for each blank */}
                  {Array.from({ length: displayParts.length - 1 }).map(
                    (_, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 font-bold text-sm bg-slate-50 select-none">
                          {idx + 1}
                        </div>

                        <div className="relative w-full">
                          <select
                            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:opacity-50 cursor-pointer"
                            value={userInputs[idx] || ""}
                            onChange={(e) =>
                              handleSelectChange(idx, e.target.value)
                            }
                            disabled={showFeedback}
                          >
                            <option value="" disabled>
                              Select a word
                            </option>
                            {options.map((opt, optIdx) => (
                              <option key={optIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={16} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
