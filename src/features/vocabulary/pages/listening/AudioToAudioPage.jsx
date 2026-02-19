import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2 } from "lucide-react";
import AudioPlayer from "../../components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
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

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await fetchPracticeQuestions("B5_Fill blanks_Audio");
      if (response && response.data && response.data.length > 0) {
        const transformed = response.data.map((q) => {
          const content = q.content || {};
          return {
            id: q.ExerciseID || q.external_id || Math.random(),
            instruction:
              q.Instruction_EN || q.instruction_en || "What do you hear?",
            displaySentence:
              q.SentenceWithBlank ||
              content.SentenceWithBlank ||
              "Le ___ est dans la cuisine.",
            fullSentence:
              q.CompleteSentence || content.CompleteSentence || q.Audio || "",
            options: [
              q.Option1 || content.Option1,
              q.Option2 || content.Option2,
              q.Option3 || content.Option3,
              q.Option4 || content.Option4,
            ].filter(Boolean),
            correctAnswer:
              q.CorrectAnswer ||
              content.CorrectAnswer ||
              q.Option1 ||
              content.Option1,
          };
        });
        setQuestions(transformed);
      } else {
        console.error("[AudioToAudio] ❌ API returned empty data");
        setQuestions([]);
      }
    } catch (err) {
      console.error("[AudioToAudio] ❌ Failed to load:", err);
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
        questionTypeFr="Choisissez l'audio correspondant"
        questionTypeEn="Choose the matching audio"
        instructionFr="Écoutez et choisissez"
        instructionEn={currentQ?.instruction}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => (window.location.href = "/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={(!!selectedOption && !showFeedback) || showFeedback}
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
        correctAnswer={!isCorrect ? currentQ.correctAnswer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-8 md:gap-16 px-4 pb-32">
          {/* Left Side: Audio & Sentence */}
          <div className="flex flex-col items-center gap-8 w-full md:w-1/2">
            <AudioPlayer text={currentQ?.fullSentence || ""} />

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

            <div className="grid grid-cols-1 gap-3 w-full">
              {currentQ?.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ?.correctAnswer;
                const isWrongSelection =
                  showFeedback && isSelected && opt !== currentQ?.correctAnswer;
                const isCorrectHighlight = showFeedback && isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={showFeedback}
                    className={cn(
                      "group relative p-4 rounded-2xl border-[3px] text-left font-medium text-lg md:text-xl transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                      // Default (Base border/text)
                      "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                      // Selected (Pre-submission)
                      isSelected &&
                        !showFeedback &&
                        "border-sky-400 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300",
                      // Feedback: Correct
                      isCorrectHighlight &&
                        "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
                      // Feedback: Wrong
                      isWrongSelection &&
                        "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
                    )}
                  >
                    {/* Circle Indicator (from Phonetics design) */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        isSelected || isCorrectHighlight
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-300 dark:border-slate-500 text-transparent",
                        // Override color for feedback
                        isCorrectHighlight && "border-green-500 bg-green-500",
                        isWrongSelection && "border-red-500 bg-red-500",
                      )}
                    >
                      <span className="text-[10px] font-bold">
                        {isWrongSelection ? "✕" : "✓"}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      {!showFeedback ? (
                        /* Waveform SVG (Visible before submit) */
                        <svg
                          width="120"
                          height="30"
                          viewBox="0 0 120 40"
                          className={cn(
                            "transition-colors",
                            isSelected
                              ? "text-sky-500"
                              : "text-slate-400 dark:text-slate-500",
                          )}
                        >
                          {/* Simplified bars for cleaner look in the new layout */}
                          <rect
                            x="10"
                            y="15"
                            width="3"
                            height="10"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="16"
                            y="10"
                            width="3"
                            height="20"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="22"
                            y="5"
                            width="3"
                            height="30"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="28"
                            y="12"
                            width="3"
                            height="16"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="34"
                            y="18"
                            width="3"
                            height="4"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="40"
                            y="8"
                            width="3"
                            height="24"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="46"
                            y="14"
                            width="3"
                            height="12"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="52"
                            y="11"
                            width="3"
                            height="18"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="58"
                            y="16"
                            width="3"
                            height="8"
                            fill="currentColor"
                            rx="1.5"
                          />
                          <rect
                            x="64"
                            y="13"
                            width="3"
                            height="14"
                            fill="currentColor"
                            rx="1.5"
                          />
                        </svg>
                      ) : (
                        /* Text Reveal (Visible after submit) */
                        <span className="text-lg font-medium">{opt}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
