import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Search,
  CheckCircle2,
  Volume2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock data (replace with actual API fetch later if needed)
const MOCK_WORDS = [
  { id: 1, word: "vous", meaning: "you; yourselves (plural; formal)" },
  { id: 2, word: "chat", meaning: "cat" },
  { id: 3, word: "merci", meaning: "thank you" },
];

export default function PronunciationPage() {
  const navigate = useNavigate();

  // Game state
  const [questions, setQuestions] = useState(MOCK_WORDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Interaction State
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  // 'idle', 'recording', 'analyzing', 'correct', 'incorrect'
  const [feedbackState, setFeedbackState] = useState("idle");

  const recognitionRef = useRef(null);
  const currentWord = questions[currentIndex];

  // Initialize Speech Recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.interimResults = false; // Need final result for analysis

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setFeedbackState("recording");
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setSpokenText(transcript);
        analyzeSpeech(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setFeedbackState("idle");
        // Could show an error toast here
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // If it ended naturally without results, go back to idle.
        // But if we got results, `onresult` will handle the state change.
        setFeedbackState((prev) => (prev === "recording" ? "idle" : prev));
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentIndex]); // Re-attach when word changes to get fresh closure if needed

  const playAudio = () => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = "fr-FR";
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  const analyzeSpeech = (transcript) => {
    setFeedbackState("analyzing");

    // Simulate slight delay for "analyzing" UI to be visible
    setTimeout(() => {
      const targetWord = currentWord.word.toLowerCase();
      // Simple match logic, can be improved with fuzzy matching
      const isCorrect = transcript.toLowerCase().includes(targetWord);

      if (isCorrect) {
        setFeedbackState("correct");
        setScore((prev) => prev + 1);

        // Auto advance after correct answer
        setTimeout(() => {
          handleNext();
        }, 2000);
      } else {
        setFeedbackState("incorrect");
      }
    }, 1500);
  };

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (feedbackState === "idle" || feedbackState === "incorrect") {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting recognition", e);
        // If it was already started, this catches the InvalidStateError
      }
    } else if (feedbackState === "recording") {
      recognitionRef.current.stop();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFeedbackState("idle");
      setSpokenText("");
    } else {
      setIsGameOver(true);
    }
  };

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-in zoom-in duration-300">
        {/* Basic Game Over UI */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Quiz Complete!
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          You pronounced{" "}
          <span className="font-bold text-blue-600">{score}</span> out of{" "}
          {questions.length} words correctly.
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/practice")}
          >
            Back to Practice
          </Button>
          <Button
            size="lg"
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setIsGameOver(false);
              setFeedbackState("idle");
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-slate-950 font-sans">
      {/* Header Area */}
      <div className="pt-6 px-6 shrink-0 absolute top-0 left-0 right-0 z-10 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shadow-sm bg-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {/* Custom Progress Display aligned with design */}
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <span>Words</span>
            <span className="text-sky-500">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Segmented Progress */}
          <div className="flex gap-1 items-center">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-all duration-300",
                  idx < currentIndex
                    ? "bg-emerald-400" // Completed
                    : idx === currentIndex
                      ? "bg-emerald-400" // Current
                      : "bg-purple-100 dark:bg-purple-900/40", // Pending
                )}
              />
            ))}
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="bg-purple-50/50 dark:bg-purple-900/10 px-8 py-3 rounded-lg border border-purple-100 dark:border-purple-800/30 mb-16 max-w-sm text-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200">
            Try pronouncing this word
          </h2>
        </div>

        <div className="flex items-start justify-center gap-6 w-full max-w-lg relative animate-in slide-in-from-bottom-4 fade-in duration-500">
          {/* Speaker Button */}
          <button onClick={playAudio} className="group relative flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-200 dark:bg-purple-800/40 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm">
              <Volume2 className="w-8 h-8 text-slate-800 dark:text-slate-200 group-hover:text-purple-700 transition-colors" />
            </div>
          </button>

          {/* Word Display */}
          <div className="flex flex-col items-start gap-3 mt-1">
            <div className="bg-purple-50/50 dark:bg-purple-900/10 px-6 py-2 rounded-lg border border-purple-100 dark:border-purple-800/30 inline-block">
              <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentWord.word}
              </span>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {currentWord.meaning}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Area */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center">
        <div className="flex flex-col items-center justify-center gap-4 transition-all duration-300 min-h-[160px]">
          {/* State: Idle or Recording */}
          {(feedbackState === "idle" ||
            feedbackState === "recording" ||
            feedbackState === "incorrect") && (
            <div className="flex flex-col items-center gap-4">
              {feedbackState === "incorrect" && (
                <div className="text-center font-bold text-slate-700 mb-2 animate-in slide-in-from-bottom-2 fade-in">
                  Not quite there.
                  <br />
                  Listen carefully and
                  <br />
                  try again
                </div>
              )}

              <button
                onClick={handleToggleRecord}
                className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                  feedbackState === "recording"
                    ? "bg-slate-800 scale-105"
                    : "bg-slate-900 hover:scale-105",
                )}
              >
                {/* Radar pulsing effect during recording */}
                {feedbackState === "recording" && (
                  <>
                    <span className="absolute inset-0 rounded-full border border-slate-700 animate-[ping_1.5s_ease-out_infinite]" />
                    <span className="absolute inset-[-10px] rounded-full border border-slate-800 animate-[ping_2s_ease-out_infinite]" />
                  </>
                )}
                <Mic
                  className={cn(
                    "w-10 h-10 text-white z-10",
                    feedbackState === "recording" && "text-purple-400",
                  )}
                />
              </button>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {feedbackState === "recording"
                  ? "Recording..."
                  : "Tap to record"}
              </span>
            </div>
          )}

          {/* State: Analyzing */}
          {feedbackState === "analyzing" && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                Analysing
              </span>
              <div className="w-24 h-24 bg-purple-300 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <Search className="w-10 h-10 text-slate-800" />
              </div>
            </div>
          )}

          {/* State: Correct / Success */}
          {feedbackState === "correct" && (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Well done!
              </span>
              <div className="w-28 h-28 bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.4)]">
                <div className="w-16 h-16 bg-emerald-950 rounded-full flex items-center justify-center">
                  <CheckCircle2
                    className="w-10 h-10 text-emerald-400"
                    strokeWidth={3}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
