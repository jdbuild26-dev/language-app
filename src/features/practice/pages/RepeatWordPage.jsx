import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Mic, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { calculateSimilarity, normalizeText } from "@/utils/textComparison";
import { loadMockCSV } from "@/utils/csvLoader";

export default function RepeatWordPage() {
  const navigate = useNavigate();

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
  const [displaySentence, setDisplaySentence] = useState("");

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setSpokenText(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/speaking/repeat_word.csv");
        // Shuffle or just use as is
        const shuffled = data.sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
      } catch (error) {
        console.error("Error fetching repeat word data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Timer (Stopwatch mode)
  const { timerString, resetTimer } = useExerciseTimer({
    mode: "stopwatch",
    isPaused: isLoading || isGameOver,
  });

  const currentQuestion = questions[currentIndex];

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpokenText(""); // Clear previous
      setFeedback(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || !spokenText) return;

    // Strict matching: User must speak ONLY the word, not the full sentence
    // We compare the normalized spoken text directly against the correct answer
    const similarity = calculateSimilarity(
      spokenText,
      currentQuestion.correctAnswer,
    );
    const isCorrectMatch = similarity >= 0.7;

    if (isCorrectMatch) {
      setScore((prev) => prev + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const handleNext = () => {
    setSpokenText("");
    setFeedback(null);
    setIsListening(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentIndex(0);
    setIsGameOver(false);
    resetTimer();
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <Button
          onClick={() => navigate("/practice")}
          variant="outline"
          className="mt-4"
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <PracticeGameLayout
      title="Repeat Word"
      questionType="Fill in the blank by speaking the missing word"
      instructionFr={
        currentQuestion.instructionFr || currentQuestion.instruction
      }
      instructionEn={
        currentQuestion.instructionEn || currentQuestion.instruction_en
      }
      progress={((currentIndex + 1) / questions.length) * 100}
      score={score}
      totalQuestions={questions.length}
      isGameOver={isGameOver}
      timerValue={timerString}
      onExit={() => navigate("/practice")}
      onNext={feedback ? handleNext : handleSubmit}
      onRestart={handleRestart}
      isSubmitEnabled={Boolean(spokenText)}
      showFeedback={!!feedback}
      isCorrect={feedback === "correct"}
      feedbackMessage={feedback === "correct" ? "Excellent!" : "Try again"}
      correctAnswer={currentQuestion?.correctAnswer}
      submitLabel={feedback ? "Continue" : "Submit"}
    >
      <div className="flex flex-col items-center justify-center max-w-3xl w-full gap-12">
        {/* Sentence Display with Inline Input Boxes */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
          {feedback === "correct" && (
            <div className="absolute inset-0 bg-green-500/10 z-0" />
          )}
          {feedback === "incorrect" && (
            <div className="absolute inset-0 bg-red-500/10 z-0" />
          )}

          <div className="text-lg md:text-xl text-slate-800 dark:text-slate-100 leading-relaxed font-medium relative z-10">
            {(() => {
              const sentence =
                currentQuestion.sentenceWithBlank ||
                currentQuestion["Sentence With Blank"] ||
                currentQuestion.Sentence ||
                "";
              const correctAnswer = currentQuestion.correctAnswer || "";
              const words = sentence.split(" ");

              return words.map((word, idx) => {
                const isLast = idx === words.length - 1;
                const spacer = !isLast ? " " : "";

                // Check if this word contains the blank (underscores) - supporting 3+ underscores
                if (word.includes("___")) {
                  // Split by _ to get surrounding punctuation/text
                  const parts = word.split(/_{3,}/);
                  const beforeBlank = parts[0] || "";
                  const afterBlank = parts[1] || "";

                  // Create character boxes for the correct answer
                  const answerChars = correctAnswer.toUpperCase().split("");

                  // Determine what to show in boxes based on spoken text
                  const spokenChars = spokenText.toUpperCase().split("");

                  return (
                    <React.Fragment key={idx}>
                      {beforeBlank}
                      <span className="inline-flex gap-1 mx-1 align-baseline">
                        {answerChars.map((char, charIdx) => {
                          // First and last are hints
                          const isHint =
                            charIdx === 0 || charIdx === answerChars.length - 1;

                          // Determine the displayed value
                          let displayValue = "";
                          if (isHint) {
                            displayValue = char; // Show hint
                          } else if (feedback) {
                            // After submission, show correct answer
                            displayValue = char;
                          }

                          // Styling based on feedback state
                          let borderColorClass =
                            "border-gray-300 dark:border-gray-600";
                          if (isHint) {
                            borderColorClass =
                              "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600";
                          }
                          if (feedback === "correct") {
                            borderColorClass =
                              "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                          } else if (feedback === "incorrect") {
                            borderColorClass =
                              "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                          }

                          return (
                            <span
                              key={charIdx}
                              className={`
                                inline-flex items-center justify-center
                                w-7 h-9 md:w-8 md:h-10 
                                border-2 rounded-md 
                                text-center text-base md:text-lg font-semibold uppercase 
                                transition-all duration-200
                                ${borderColorClass}
                                ${isHint ? "cursor-default" : ""}
                              `}
                            >
                              {displayValue}
                            </span>
                          );
                        })}
                      </span>
                      {afterBlank}
                      {spacer}
                    </React.Fragment>
                  );
                }

                return (
                  <span key={idx}>
                    {word}
                    {spacer}
                  </span>
                );
              });
            })()}
          </div>
        </div>

        {/* DEBUG: Show Answer for Testing */}
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-mono">
            Hint (Testing): {currentQuestion?.correctAnswer}
          </p>
        </div>

        {/* Mic Button & Interaction */}
        <div className="relative">
          <button
            onClick={handleToggleListening}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
              isListening
                ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30",
            )}
          >
            <Mic className={cn("w-10 h-10", isListening && "animate-bounce")} />
          </button>

          {isListening && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-sm font-medium text-red-500 animate-pulse">
                Listening...
              </span>
            </div>
          )}
        </div>

        {/* Spoken Text Feedback */}
        <div className="h-16 w-full text-center">
          {spokenText && (
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
              "{spokenText}"
            </p>
          )}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
