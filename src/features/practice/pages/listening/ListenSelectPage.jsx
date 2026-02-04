import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function ListenSelectPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking, cancel } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 30;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchAndTransformQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/listening/listen_select.csv");

        if (!data || data.length === 0) {
          setQuestions([]);
          return;
        }

        // Transform data: Invert logic
        // Original: French Audio -> English Options
        // New: English Text (from Correct Option) -> French Audio Options (Correct + 3 Distractors)

        const transformed = data.map((item, index, allItems) => {
          // 1. Identify Correct French Audio and English Text
          const correctFrenchAudio = item.audioText;

          // Parse options if they are stringified JSON (as seen in CSV)
          let originalOptions = [];
          try {
            // Handle case where options might be already parsed or string array
            if (Array.isArray(item.options)) {
              originalOptions = item.options;
            } else if (typeof item.options === "string") {
              // The CSV loader might have returned it as string with quotes, e.g. "['a', 'b']"
              // simple replacement for mock data standard usually used in this project
              originalOptions = JSON.parse(item.options.replace(/'/g, '"'));
            }
          } catch (e) {
            console.error("Error parsing options", e);
            originalOptions = ["Error loading options"];
          }

          const englishText =
            originalOptions[item.correctIndex] || "Translate this";

          // 2. Generate Distractors from OTHER items' audioText
          const otherItems = allItems.filter((i) => i.id !== item.id);
          // Shuffle other items
          const shuffledOthers = [...otherItems].sort(
            () => Math.random() - 0.5,
          );
          const distractors = shuffledOthers
            .slice(0, 3)
            .map((i) => i.audioText);

          // 3. Create Audio Options
          const audioOptions = [correctFrenchAudio, ...distractors];
          // Shuffle options
          const shuffledAudioOptions = audioOptions
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

          // 4. Find new correct index
          const newCorrectIndex =
            shuffledAudioOptions.indexOf(correctFrenchAudio);

          return {
            ...item,
            questionText: englishText, // New English Prompt
            audioOptions: shuffledAudioOptions, // French Audio Strings
            correctIndex: newCorrectIndex,
          };
        });

        setQuestions(transformed);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndTransformQuestions();
  }, []);

  // Reset state on question change
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  const handleOptionClick = (index, audioText) => {
    if (showFeedback) return;

    // Play the option audio in French
    cancel();
    speak(audioText, "fr-FR");

    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    cancel();

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Select"
        instructionFr="Lisez et sélectionnez l'audio correspondant"
        instructionEn="Read the sentence and select the matching audio"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Main Question (English Text) */}
          <div className="w-full bg-slate-800 text-white rounded-xl p-8 mb-8 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50"></div>
            <h3 className="text-2xl md:text-3xl font-semibold leading-relaxed">
              {currentQuestion?.questionText}
            </h3>
            <p className="mt-4 text-indigo-200 text-sm font-medium uppercase tracking-wider">
              English Sentence
            </p>
          </div>

          <div className="w-full flex justify-between items-end mb-4 px-1">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              What is being said?
            </p>
            <p className="text-xs text-slate-400">
              Select the correct French audio
            </p>
          </div>

          {/* Audio Options Grid */}
          <div className="w-full grid grid-cols-1 gap-4">
            {currentQuestion?.audioOptions.map((audioText, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = index === currentQuestion.correctIndex;
              const isWrongSelection =
                showFeedback && isSelected && !isCorrectOption;
              const isCorrectHighlight = showFeedback && isCorrectOption;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index, audioText)}
                  disabled={showFeedback}
                  className={cn(
                    "group relative p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-slate-800 shadow-sm",
                    // Default state
                    "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md",
                    // Selected (pre-submission)
                    isSelected &&
                      !showFeedback &&
                      "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 ring-1 ring-indigo-500",
                    // Feedback: Correct
                    isCorrectHighlight &&
                      "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500",
                    // Feedback: Wrong
                    isWrongSelection &&
                      "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500",
                  )}
                >
                  {/* Selection Indicator */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected || isCorrectHighlight
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-300",
                      isCorrectHighlight && "border-green-500 bg-green-500",
                      isWrongSelection && "border-red-500 bg-red-500",
                    )}
                  >
                    {isCorrectHighlight && (
                      <span className="font-bold text-sm">✓</span>
                    )}
                    {isWrongSelection && (
                      <span className="font-bold text-sm">✕</span>
                    )}
                    {!isCorrectHighlight && !isWrongSelection && isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Audio Visualizer & Placeholder */}
                  <div className="flex-1 flex items-center gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors",
                        (isSelected || isCorrectHighlight) &&
                          "bg-indigo-100 dark:bg-indigo-900/50",
                      )}
                    >
                      <Volume2
                        className={cn(
                          "w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
                          (isSelected || isCorrectHighlight) &&
                            "text-indigo-600 dark:text-indigo-400",
                        )}
                      />
                    </div>

                    {/* Fake Waveform */}
                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-60 transition-opacity">
                      {[1, 2, 3, 2, 4, 2, 1, 2, 3, 1, 2, 1].map((h, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 bg-slate-800 dark:bg-white rounded-full transition-all duration-300",
                            isSelected && !showFeedback ? "animate-pulse" : "",
                          )}
                          style={{ height: `${h * 4 + 4}px` }}
                        ></div>
                      ))}
                    </div>

                    {!showFeedback && (
                      <span className="text-sm text-slate-400 font-medium ml-2">
                        Click to listen
                      </span>
                    )}
                    {showFeedback && (
                      <span
                        className={cn(
                          "text-sm font-medium ml-2",
                          isCorrectHighlight
                            ? "text-green-600"
                            : "text-slate-500",
                        )}
                      >
                        {isCorrectHighlight ? "Correct Audio" : "Audio Option"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect ? "Listen to the audio marked with checkmark" : null
          }
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
