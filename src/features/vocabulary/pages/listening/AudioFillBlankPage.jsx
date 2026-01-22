import React, { useState, useEffect, useRef } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, Volume2, ArrowRight } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function AudioFillBlankPage() {
  const { speak, isSpeaking } = useTextToSpeech();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("B5_Fill blanks_Audio");
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
    if (showFeedback) return;

    const currentQ = questions[currentIndex];

    const normalizedInput = userInput
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "");
    const normalizedAnswer = currentQ.answer
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "");

    const correct = normalizedInput === normalizedAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((s) => s + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setUserInput("");
    handleNext();
  };

  const handleNext = () => {
    setShowFeedback(false);
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

  // Auto-play on new question
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  return (
    <>
      <PracticeGameLayout
        questionType="Audio Fill in the Blank"
        instructionFr="Écoutez et complétez la phrase"
        instructionEn={
          currentQ?.instruction || "Listen and complete the sentence"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => (window.location.href = "/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
        showSubmitButton={true}
        submitLabel="Submit"
      >
        <div className="flex flex-col items-center w-full max-w-2xl">
          <button
            onClick={playSentence}
            className={`mb-8 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-md
               ${
                 isSpeaking
                   ? "bg-purple-100 text-purple-600 ring-4 ring-purple-200"
                   : "bg-white dark:bg-slate-800 hover:bg-gray-50 text-purple-500"
               }
             `}
          >
            <Volume2 className="w-10 h-10" />
          </button>

          <div className="text-lg md:text-xl font-medium text-center text-gray-800 dark:text-gray-100 mb-8 leading-relaxed">
            {currentQ?.displaySentence.split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block w-32 border-b-2 border-gray-400 mx-2 relative top-1" />
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
              disabled={showFeedback}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Type the missing word..."
              className="w-full p-4 text-center text-xl rounded-xl border-2 outline-none transition-all border-gray-200 dark:border-slate-700 focus:border-blue-500 bg-white dark:bg-slate-800"
            />
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQ.answer : null}
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
