import React, { useState, useEffect } from "react";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, Volume2, CheckCircle, XCircle } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function AudioToAudioPage() {
  const { speak } = useTextToSpeech();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("B5_Fill blanks_Audio");
      if (response && response.data && response.data.length > 0) {
        const transformed = response.data.map((q) => ({
          id: q.ExerciseID || Math.random(),
          instruction: q.Instruction_EN || "What do you hear?",
          displaySentence: q.SentenceWithBlank || "Le ___ est dans la cuisine.",
          fullSentence: q.CompleteSentence || q.Audio || "", // Text to speak for context
          options: [q.Option1, q.Option2, q.Option3, q.Option4].filter(Boolean),
          correctAnswer: q.CorrectAnswer || q.Option1, // Fallback
        }));
        setQuestions(transformed);
      } else {
        console.error("API returned empty data");
        setQuestions([]);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };


  const handleOptionSelect = (opt) => {
    if (showFeedback) return;
    // Play TTS for the option
    speak(opt, "fr-FR");
    // Select it as the answer
    setSelectedOption(opt);
  };

  const playSentence = () => {
    const q = questions[currentIndex];
    if (q?.fullSentence) speak(q.fullSentence, "fr-FR");
  };

  const playOption = (e, text) => {
    e.stopPropagation(); // Prevent selecting when clicking play? or maybe playing selects it?
    // Design shows speaker icon inside the button.
    speak(text, "fr-FR");
  };

  const handleSubmit = () => {
    if (showFeedback) return;
    if (!selectedOption) return;

    const q = questions[currentIndex];
    const correct =
      selectedOption?.toLowerCase() === q.correctAnswer?.toLowerCase();
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];
  // Auto-play sentence on load
  useEffect(() => {
    if (!loading && !isCompleted && currentQ) {
      // speak(currentQ.fullSentence, "fr-FR");
    }
  }, [currentIndex, loading, isCompleted]);

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );

  return (
    <>
      <PracticeGameLayout
        questionType="Audio Match"
        instructionFr="Écoutez et choisissez"
        instructionEn={currentQ?.instruction}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => (window.location.href = "/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedOption && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit"
      >
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-8 md:gap-16 px-4">
          {/* Left Side: Audio & Sentence */}
          <div className="flex flex-col items-center gap-8 w-full md:w-1/2">
            <button
              onClick={playSentence}
              className="w-40 h-40 md:w-56 md:h-56 bg-sky-500 rounded-3xl shadow-[0_6px_0_0_#0ea5e9] hover:bg-sky-400 active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center text-white"
            >
              <Volume2
                className="w-20 h-20 md:w-24 md:h-24"
                strokeWidth={1.5}
              />
            </button>

            <h2 className="text-lg md:text-xl font-medium text-slate-700 dark:text-slate-200 text-center leading-relaxed">
              {currentQ?.displaySentence.split("_____").map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block border-b-4 border-slate-300 min-w-[3rem] mx-2" />
                  )}
                </React.Fragment>
              ))}
            </h2>
          </div>

          {/* Right Side: Options */}
          <div className="flex flex-col w-full md:w-1/2 max-w-md gap-6">
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">
              {currentQ?.instruction || "Choose the correct option"}
            </h3>

            <div className="flex flex-col gap-3 w-full">
              {currentQ?.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={showFeedback}
                    className={cn(
                      "group relative p-6 rounded-2xl border-[3px] transition-all flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm",
                      // Default
                      "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
                      // Selected
                      isSelected &&
                        "border-sky-400 bg-sky-50 dark:bg-sky-900/20",
                      // Feedback states
                      showFeedback && opt === currentQ?.correctAnswer &&
                        "border-green-400 bg-green-50 dark:bg-green-900/20",
                      showFeedback && isSelected && opt !== currentQ?.correctAnswer &&
                        "border-red-400 bg-red-50 dark:bg-red-900/20",
                    )}
                  >
                    {/* Static Waveform SVG */}
                    <svg 
                      width="120" 
                      height="40" 
                      viewBox="0 0 120 40" 
                      className={cn(
                        "transition-colors",
                        isSelected 
                          ? "text-sky-500" 
                          : showFeedback && opt === currentQ?.correctAnswer
                          ? "text-green-500"
                          : showFeedback && isSelected && opt !== currentQ?.correctAnswer
                          ? "text-red-500"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      <rect x="2" y="15" width="3" height="10" fill="currentColor" rx="1.5"/>
                      <rect x="8" y="10" width="3" height="20" fill="currentColor" rx="1.5"/>
                      <rect x="14" y="12" width="3" height="16" fill="currentColor" rx="1.5"/>
                      <rect x="20" y="8" width="3" height="24" fill="currentColor" rx="1.5"/>
                      <rect x="26" y="14" width="3" height="12" fill="currentColor" rx="1.5"/>
                      <rect x="32" y="11" width="3" height="18" fill="currentColor" rx="1.5"/>
                      <rect x="38" y="16" width="3" height="8" fill="currentColor" rx="1.5"/>
                      <rect x="44" y="13" width="3" height="14" fill="currentColor" rx="1.5"/>
                      <rect x="50" y="9" width="3" height="22" fill="currentColor" rx="1.5"/>
                      <rect x="56" y="17" width="3" height="6" fill="currentColor" rx="1.5"/>
                      <rect x="62" y="12" width="3" height="16" fill="currentColor" rx="1.5"/>
                      <rect x="68" y="15" width="3" height="10" fill="currentColor" rx="1.5"/>
                      <rect x="74" y="11" width="3" height="18" fill="currentColor" rx="1.5"/>
                      <rect x="80" y="14" width="3" height="12" fill="currentColor" rx="1.5"/>
                      <rect x="86" y="10" width="3" height="20" fill="currentColor" rx="1.5"/>
                      <rect x="92" y="16" width="3" height="8" fill="currentColor" rx="1.5"/>
                      <rect x="98" y="13" width="3" height="14" fill="currentColor" rx="1.5"/>
                      <rect x="104" y="15" width="3" height="10" fill="currentColor" rx="1.5"/>
                      <rect x="110" y="18" width="3" height="4" fill="currentColor" rx="1.5"/>
                    </svg>

                    {/* Feedback Icons */}
                    {showFeedback && (
                      <div className="absolute top-2 right-2">
                        {opt === currentQ?.correctAnswer ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isSelected && opt !== currentQ?.correctAnswer ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQ.correctAnswer : null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
