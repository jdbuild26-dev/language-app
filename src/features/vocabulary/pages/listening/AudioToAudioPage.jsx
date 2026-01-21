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
        console.warn("API returned empty, using MOCK data");
        setQuestions(MOCK_DATA);
      }
    } catch (err) {
      console.error(err);
      setQuestions(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  const MOCK_DATA = [
    {
      id: 1,
      instruction: "What do you hear?",
      displaySentence: "Le chien et le _____ jouent dans le jardin.",
      fullSentence: "Le chien et le chat jouent dans le jardin.",
      options: ["chat", "rat", "plat", "drap"],
      correctAnswer: "chat",
    },
    {
      id: 2,
      instruction: "What do you hear?",
      displaySentence: "J'aime manger des _____.",
      fullSentence: "J'aime manger des pommes.",
      options: ["pommes", "poires", "gommes", "sommes"],
      correctAnswer: "pommes",
    },
  ];

  const handleOptionSelect = (opt) => {
    if (showFeedback) return;
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

            <h2 className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-200 text-center leading-relaxed">
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
                      "group relative p-4 rounded-2xl border-[3px] text-left font-medium text-lg transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                      // Default
                      "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                      // Selected
                      isSelected &&
                        "border-sky-400 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300",
                    )}
                  >
                    {/* Fake Radio/Checkbox Circle */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        isSelected
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-300 dark:border-slate-500 text-transparent",
                      )}
                    >
                      <span className="text-[10px] font-bold">✓</span>
                    </div>

                    <div className="flex items-center gap-3 w-full overflow-hidden">
                      {/* Optional: Add Play Button for option if desired, or just text */}
                      <span className="truncate">{opt}</span>
                    </div>
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
