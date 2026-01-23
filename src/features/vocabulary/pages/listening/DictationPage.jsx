import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2 } from "lucide-react";
import AudioPlayer from "../../components/shared/AudioPlayer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";

export default function DictationPage() {
  const { speak, isSpeaking } = useTextToSpeech();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef(null);

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 60, // Dictation might take longer? keeping 60s
    mode: "timer",
    onExpire: () => {
      if (status === "idle" && !isCompleted) {
        handleSubmit();
      }
    },
    isPaused: loading || isCompleted || status !== "idle",
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
      const response = await fetchPracticeQuestions("B6_Fill blanks_Typing");
      if (response && response.data) {
        const transformed = response.data.map((item) => ({
          id: item["ExerciseID"],
          fullSentence: item["CompleteSentence"] || item["Audio"],
          displaySentence: item["SentenceWithBlank"],
          answer: item["CorrectAnswer"],
          instruction:
            item["Instruction_EN"] || "Listen and complete the sentence",
        }));
        setQuestions(transformed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (status !== "idle") {
      handleNext();
      return;
    }

    const currentQ = questions[currentIndex];
    const normalizedInput = userInput
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "");
    const normalizedAnswer = currentQ.answer
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "");

    if (normalizedInput === normalizedAnswer) {
      setStatus("success");
      setScore((s) => s + 1);
      speak("Correct!", "en-US");
    } else {
      setStatus("error");
      speak(`Incorrect. The answer was ${currentQ.answer}`, "en-US");
    }
  };

  const handleNext = () => {
    setStatus("idle");
    setUserInput("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const playSentence = () => {
    if (questions[currentIndex]) {
      speak(questions[currentIndex].fullSentence, "fr-FR", 0.85);
    }
  };

  useEffect(() => {
    if (!loading && !isCompleted && questions.length > 0) {
      const t = setTimeout(() => {
        playSentence();
        if (inputRef.current) inputRef.current.focus();
      }, 800);
      return () => clearTimeout(t);
    }
  }, [currentIndex, loading, isCompleted]);

  const currentQ = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  let submitLabel = "Check";
  if (status !== "idle")
    submitLabel = currentIndex === questions.length - 1 ? "Finish" : "Next";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  return (
    <PracticeGameLayout
      questionTypeFr="Dictée"
      questionTypeEn="Dictation"
      instructionFr="Écoutez et écrivez le mot manquant"
      instructionEn={
        currentQ?.instruction || "Listen and type the missing word"
      }
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={() => (window.location.href = "/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={userInput.trim().length > 0}
      showSubmitButton={true}
      submitLabel={submitLabel}
      timerValue={timerString}
    >
      <div className="flex flex-col items-center w-full max-w-2xl">
        <div className="mb-8">
          <AudioPlayer text={questions[currentIndex]?.fullSentence || ""} />
        </div>

        <div className="text-lg md:text-xl font-medium text-center text-gray-800 dark:text-gray-100 mb-8 leading-relaxed">
          {currentQ?.displaySentence.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block w-32 border-b-2 border-gray-400 mx-2 relative top-1">
                  {status !== "idle" && (
                    <span
                      className={`absolute -top-8 left-0 w-full text-center text-sm font-bold ${
                        status === "success" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {status === "success" ? userInput : currentQ.answer}
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="w-full relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={status !== "idle"}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Type the missing word..."
            className={`w-full p-4 text-center text-xl rounded-xl border-2 outline-none transition-all
                      ${
                        status === "idle"
                          ? "border-gray-200 dark:border-slate-700 focus:border-blue-500 bg-white dark:bg-slate-800"
                          : ""
                      }
                      ${
                        status === "success"
                          ? "border-green-500 bg-green-50 text-green-900"
                          : ""
                      }
                      ${
                        status === "error"
                          ? "border-red-500 bg-red-50 text-red-900"
                          : ""
                      }
                   `}
          />
        </div>
      </div>
    </PracticeGameLayout>
  );
}
