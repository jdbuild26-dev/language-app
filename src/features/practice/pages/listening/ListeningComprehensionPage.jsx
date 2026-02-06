import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import FullScreenLayout from "@/components/layout/FullScreenLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { Button } from "@/components/ui/button";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";

export default function ListeningComprehensionPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking, stop } = useTextToSpeech();

  // State
  const [scenarioData, setScenarioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  // Audio Control State
  const [progress, setProgress] = useState(0);
  const [charOffset, setCharOffset] = useState(0);

  // Use ref for isDragging to avoid stale closures in callbacks
  const isDraggingRef = useRef(false);
  const textLength = scenarioData?.audioText.length || 0;

  const speakChunk = (offset) => {
    const textToSpeak = scenarioData?.audioText.slice(offset);

    speak(textToSpeak, "fr-FR", 0.9, {
      onBoundary: (e) => {
        if (!isDraggingRef.current) {
          const currentGlobalIndex = offset + e.charIndex;
          const p = (currentGlobalIndex / textLength) * 100;
          setProgress(p);
        }
      },
      onEnd: () => {
        if (!isDraggingRef.current) {
          setIsPlaying(false);
          setProgress(100);
          setCharOffset(0);
        }
      },
      onStart: () => {
        setIsPlaying(true);
      },
    });
  };

  const handlePlayPause = () => {
    if (isSpeaking || isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      // If we finished (progress 100), restart from 0
      const startOffset = progress >= 100 ? 0 : charOffset;
      if (startOffset === 0) setProgress(0); // Reset visual
      speakChunk(startOffset);
    }
  };

  // Sync external interruption logic
  useEffect(() => {
    if (!isSpeaking && isPlaying) {
      // Logic handled mostly by callbacks now
    }
  }, [isSpeaking]);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const data = await loadMockCSV(
          "practice/listening/listening_comprehension.csv",
        );
        if (data && data.length > 0) {
          setScenarioData(data[0]);
        }
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScenario();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      isDraggingRef.current = false;
    };
  }, []); // eslint-disable-line

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    isDraggingRef.current = true;
    setProgress(val);
  };

  const handleSliderCommit = () => {
    const val = progress; // Use current progress state

    // Calculate new offset
    let newIndex = Math.floor((val / 100) * textLength);
    // Safety check
    if (newIndex >= textLength) newIndex = textLength - 1;
    if (newIndex < 0) newIndex = 0;

    // Word boundary heuristic: find previous space
    if (newIndex > 0) {
      const lastSpace = scenarioData?.audioText.lastIndexOf(" ", newIndex);

      if (lastSpace !== -1) {
        newIndex = lastSpace + 1; // Start after the space
      }
    }

    setCharOffset(newIndex);

    // Stop first
    stop();

    // We set dragging to false right before restarting or resuming logic
    setTimeout(() => {
      isDraggingRef.current = false;
      if (isPlaying) {
        speakChunk(newIndex);
      }
    }, 50);
  };

  const handleInputChange = (id, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const checkAnswer = (input, question) => {
    if (!input) return false;
    const normalizedInput = input.toLowerCase().trim();
    const normalizedAnswer = question.answer.toLowerCase();

    if (normalizedInput === normalizedAnswer) return true;
    if (question.accept) {
      return question.accept.some((target) =>
        normalizedInput.includes(target.toLowerCase()),
      );
    }
    return false;
  };

  const handleSubmit = () => {
    let correctCount = 0;
    scenarioData?.questions.forEach((q) => {
      if (checkAnswer(userAnswers[q.id], q)) {
        correctCount++;
      }
    });
    setScore(correctCount);

    setIsSubmitted(true);
    setShowFeedback(true);
    stop(); // Stop audio if playing
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (!scenarioData) {
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

  return (
    <FullScreenLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        {/* Sticky Header with Audio Player */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all bg-blue-500 hover:bg-blue-600 text-white shadow-lg shrink-0",
                isPlaying && "ring-4 ring-blue-500/20",
              )}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  Audio Scenario
                </span>
                {isPlaying && (
                  <span className="text-xs font-bold text-blue-500 animate-pulse ml-2">
                    PLAYING...
                  </span>
                )}
              </div>

              {/* Slider Control */}
              <div className="relative w-full h-6 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={handleSliderChange}
                  onMouseUp={handleSliderCommit}
                  onTouchEnd={handleSliderCommit}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleExit}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="sr-only">Exit</span>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-32">
          <div className="text-center mb-10 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {scenarioData?.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Listen to the scenario carefully. The questions are hidden so you
              can focus on listening. When you are ready, reveal the questions.
            </p>
          </div>

          {!showQuestions ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-16 h-16 text-blue-500 opacity-80" />
              </div>
              <Button
                onClick={() => setShowQuestions(true)}
                className="h-14 px-8 text-lg rounded-xl"
                size="lg"
                variant="outline"
              >
                Show Questions
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
              {Array.isArray(scenarioData?.questions) ? (
                scenarioData?.questions.map((q, index) => {
                  const isCorrectItem =
                    isSubmitted && checkAnswer(userAnswers[q.id], q);
                  const isWrongItem = isSubmitted && !isCorrectItem;

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "bg-white dark:bg-slate-800 rounded-xl p-6 border-2 transition-all",
                        isSubmitted
                          ? isCorrectItem
                            ? "border-green-500 bg-green-50/10"
                            : "border-red-300 bg-red-50/10"
                          : "border-slate-100 dark:border-slate-700 shadow-sm",
                      )}
                    >
                      <label className="block text-base font-medium text-slate-800 dark:text-slate-200 mb-3">
                        {index + 1}. {q.question}
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={userAnswers[q.id] || ""}
                        onChange={(e) =>
                          handleInputChange(q.id, e.target.value)
                        }
                        placeholder={q.placeholder}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-70"
                      />
                      {isSubmitted && !isCorrectItem && (
                        <div className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium animate-in fade-in">
                          Correct answer:{" "}
                          <span className="text-slate-600 dark:text-slate-300 ml-1">
                            {q.answer}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-red-500 text-center">
                  Error loading questions. Please try again later.
                </div>
              )}

              {!isSubmitted && (
                <div className="pt-8 flex justify-center">
                  <button
                    onClick={handleSubmit}
                    className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 transform active:scale-95 transition-all text-lg"
                  >
                    Submit Answers
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={score === scenarioData?.questions.length} // Only "Success" style if 100%, otherwise just info
          message={`You got ${score} out of ${scenarioData?.questions.length} correct.`}
          onContinue={handleExit} // Or maybe retry?
          continueLabel="Finish"
        >
          {/* Custom secondary button for retry if needed, but FeedbackBanner might not support children as buttons easily without looking into it. 
               We'll just use the default Continue which exits. 
           */}
        </FeedbackBanner>
      )}
    </FullScreenLayout>
  );
}
