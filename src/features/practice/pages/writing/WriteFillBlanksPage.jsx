import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Fill in the Blanks (Typed) exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    fullText: "Je vais à la boulangerie pour acheter du pain.",
    displayParts: ["Je vais à la ", " pour acheter du ", "."],
    blanks: ["boulangerie", "pain"],
    hints: ["bakery", "bread"],
    timeLimitSeconds: 60,
  },
  {
    id: 2,
    fullText: "Ma sœur travaille dans un hôpital comme médecin.",
    displayParts: ["Ma sœur travaille dans un ", " comme ", "."],
    blanks: ["hôpital", "médecin"],
    hints: ["hospital", "doctor"],
    timeLimitSeconds: 60,
  },
  {
    id: 3,
    fullText: "Nous prenons le petit déjeuner à huit heures.",
    displayParts: ["Nous prenons le petit ", " à ", " heures."],
    blanks: ["déjeuner", "huit"],
    hints: ["breakfast", "number"],
    timeLimitSeconds: 60,
  },
  {
    id: 4,
    fullText: "Les enfants jouent au football dans le parc.",
    displayParts: ["Les enfants jouent au ", " dans le ", "."],
    blanks: ["football", "parc"],
    hints: ["sport", "park"],
    timeLimitSeconds: 60,
  },
  {
    id: 5,
    fullText: "Elle a acheté une nouvelle voiture rouge.",
    displayParts: ["Elle a acheté une nouvelle ", " ", "."],
    blanks: ["voiture", "rouge"],
    hints: ["vehicle", "color"],
    timeLimitSeconds: 60,
  },
];

export default function WriteFillBlanksPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const inputRefs = useRef([]);

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [blankResults, setBlankResults] = useState([]);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

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
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInputs(new Array(currentQuestion.blanks.length).fill(""));
      setBlankResults([]);
      resetTimer();
      // Focus first input after render
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.fullText, "fr-FR");
    }
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      if (index < currentQuestion.blanks.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (userInputs.every((input) => input.trim())) {
        handleSubmit();
      }
    }
  };

  // Normalize for comparison
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleSubmit = () => {
    if (showFeedback) return;

    const results = currentQuestion.blanks.map((blank, index) => {
      const userAnswer = normalize(userInputs[index] || "");
      const correctAnswer = normalize(blank);
      return userAnswer === correctAnswer;
    });

    setBlankResults(results);

    const allCorrect = results.every((r) => r);
    setIsCorrect(allCorrect);
    setFeedbackMessage(getFeedbackMessage(allCorrect));
    setShowFeedback(true);

    if (allCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const allFilled = userInputs.every((input) => input.trim().length > 0);
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Render sentence with input blanks
  const renderSentence = () => {
    if (!currentQuestion) return null;

    const parts = currentQuestion.displayParts;
    const elements = [];

    for (let i = 0; i < parts.length; i++) {
      elements.push(
        <span key={`part-${i}`} className="text-slate-800 dark:text-slate-100">
          {parts[i]}
        </span>,
      );

      if (i < currentQuestion.blanks.length) {
        elements.push(
          <span key={`blank-container-${i}`} className="inline-block mx-1">
            <input
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              value={userInputs[i] || ""}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              disabled={showFeedback}
              className={cn(
                "w-32 px-3 py-1 rounded-lg text-center font-semibold border-2 outline-none transition-all",
                "bg-white dark:bg-slate-700",
                showFeedback && blankResults[i]
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700"
                  : showFeedback && !blankResults[i]
                    ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700"
                    : "border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              )}
              placeholder={currentQuestion.hints?.[i] || "..."}
            />
          </span>,
        );
      }
    }

    return elements;
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the Blanks"
        instructionFr="Complétez les phrases"
        instructionEn="Complete the sentences"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allFilled && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Sentence with Blanks */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xl leading-relaxed text-center">
              {renderSentence()}
            </p>
          </div>

          {/* Audio button */}
          <button
            onClick={handlePlayAudio}
            disabled={isSpeaking}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              isSpeaking
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600",
            )}
          >
            <Volume2 className="w-4 h-4" />
            Listen to full sentence
          </button>

          {/* Show correct answers after feedback */}
          {showFeedback && !isCorrect && (
            <div className="w-full mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                <span className="font-semibold">Correct answers: </span>
                {currentQuestion.blanks.join(", ")}
              </p>
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
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
