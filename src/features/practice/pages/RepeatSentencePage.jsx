import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Helper to normalize text for comparison
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
};

export default function RepeatSentencePage() {
  const navigate = useNavigate();

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0);

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
        if (event.error === "no-speech") {
          setFeedback("retry"); // New state for UI feedback
          setIsListening(false);
          return;
        }
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
        const sheetName = encodeURIComponent("D1_Repeat + Correct word");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/practice/${sheetName}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const responseJson = await response.json();
        console.log("RepeatSentence response:", responseJson); // Debug log

        let data = responseJson.data;
        if (!Array.isArray(data)) {
          console.warn("Expected array in response.data, got:", typeof data);
          data = [];
        }

        // Shuffle safe copy
        const rawData = [...data].sort(() => 0.5 - Math.random());

        // Normalize keys (Backend returns PascalCase from Sheets)
        const normalizedData = rawData.map((item) => ({
          ...item,
          instructionFr: item.Instruction_FR || item.instructionFr || "",
          instructionEn: item.Instruction_EN || item.instructionEn || "",
          sentenceWithBlank:
            item.SentenceWithBlank || item.sentenceWithBlank || "",
          correctAnswer: item.CorrectAnswer || item.correctAnswer || "",
          completeSentence:
            item.CompleteSentence || item.completeSentence || "",
        }));

        setQuestions(normalizedData);
      } catch (error) {
        console.error("Error fetching repeat sentence data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Timer
  useEffect(() => {
    if (!isLoading && !isGameOver) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, isGameOver]);

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
    if (!currentQuestion) return;

    // Check logic: Correct answer should be IN the spoken text OR match exactly
    // OR if the user speaks the full sentence, we check for that too?
    // Let's check if the *correctAnswer* is present in the spoken text.
    // This allows natural speaking ("Le chien et le chat...") or just the word ("chat").

    const normalizedSpoken = normalizeText(spokenText);
    const normalizedAnswer = normalizeText(currentQuestion.correctAnswer || "");

    // Also support checking against the full sentence just in case
    const normalizedFullSentence = normalizeText(
      currentQuestion.completeSentence
    );

    const isCorrect =
      normalizedSpoken.includes(normalizedAnswer) ||
      (normalizedFullSentence &&
        normalizedSpoken.includes(normalizedFullSentence.substring(0, 10))); // fuzzy check if too long? No, stick to answer containment.

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback("correct");
      // Play success sound?
    } else {
      setFeedback("incorrect");
    }

    // Auto-advance after small delay
    setTimeout(() => {
      handleNext();
    }, 1500);
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
    setTimer(0);
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          onClick={() => navigate("/vocabulary/practice")}
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
      title="Repeat Sentence"
      questionType="Repeat the sentence with correct word"
      instructionFr={currentQuestion.instructionFr}
      instructionEn={currentQuestion.instructionEn}
      progress={((currentIndex + 1) / questions.length) * 100}
      score={score}
      totalQuestions={questions.length}
      isGameOver={isGameOver}
      timerValue={formatTimer(timer)}
      onExit={() => navigate("/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={handleRestart}
      isSubmitEnabled={Boolean(spokenText) && !feedback}
      submitLabel={
        feedback === "correct"
          ? "Correct!"
          : feedback === "incorrect"
          ? "Incorrect"
          : "Submit"
      }
    >
      <div className="flex flex-col items-center justify-center max-w-3xl w-full gap-12">
        {/* Sentence Display */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
          {feedback === "correct" && (
            <div className="absolute inset-0 bg-green-500/10 z-0" />
          )}
          {feedback === "incorrect" && (
            <div className="absolute inset-0 bg-red-500/10 z-0" />
          )}

          <h2 className="text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed relative z-10">
            {currentQuestion.sentenceWithBlank}
          </h2>
        </div>

        {/* Mic Button & Interaction */}
        <div className="relative">
          <button
            onClick={handleToggleListening}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
              isListening
                ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30"
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
          {!isListening && spokenText && (
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium animate-in fade-in slide-in-from-bottom-2">
              "{spokenText}"
            </p>
          )}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
