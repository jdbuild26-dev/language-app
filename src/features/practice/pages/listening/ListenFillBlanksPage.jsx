import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Listen and Fill in the Blanks exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    audioText: "Je vais à la boulangerie pour acheter du pain.",
    displayParts: ["Je vais à la ", " pour acheter du ", "."],
    blanks: ["boulangerie", "pain"],
    timeLimitSeconds: 60,
  },
  {
    id: 2,
    audioText: "Elle habite dans une grande maison avec un jardin.",
    displayParts: ["Elle habite dans une grande ", " avec un ", "."],
    blanks: ["maison", "jardin"],
    timeLimitSeconds: 60,
  },
  {
    id: 3,
    audioText: "Mon frère travaille dans un hôpital comme médecin.",
    displayParts: ["Mon frère travaille dans un ", " comme ", "."],
    blanks: ["hôpital", "médecin"],
    timeLimitSeconds: 60,
  },
  {
    id: 4,
    audioText: "Nous prenons le petit déjeuner à huit heures.",
    displayParts: ["Nous prenons le petit ", " à ", " heures."],
    blanks: ["déjeuner", "huit"],
    timeLimitSeconds: 60,
  },
  {
    id: 5,
    audioText: "Les enfants jouent au football dans le parc.",
    displayParts: ["Les enfants jouent au ", " dans le ", "."],
    blanks: ["football", "parc"],
    timeLimitSeconds: 60,
  },
];

export default function ListenFillBlanksPage() {
  const navigate = useNavigate();
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
  const [hasPlayed, setHasPlayed] = useState(false);
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
    isPaused: isCompleted || showFeedback || !hasPlayed,
  });

  // Initialize inputs when question changes
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInputs(new Array(currentQuestion.blanks.length).fill(""));
      setBlankResults([]);
      setHasPlayed(false);
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.audioText, "fr-FR");
      setHasPlayed(true);
      resetTimer();
    }
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      // Move to next input or submit
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

  // Build the sentence with blanks
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
          <input
            key={`blank-${i}`}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            value={userInputs[i] || ""}
            onChange={(e) => handleInputChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={showFeedback}
            className={cn(
              "inline-block w-32 mx-1 px-3 py-1 rounded-lg text-center font-semibold border-2 outline-none transition-all",
              "bg-white dark:bg-slate-700",
              showFeedback && blankResults[i]
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700"
                : showFeedback && !blankResults[i]
                  ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700"
                  : "border-slate-300 dark:border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
            )}
            placeholder="..."
          />,
        );
      }
    }

    return elements;
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Fill"
        instructionFr="Écoutez et remplissez les blancs"
        instructionEn="Listen and fill in the blanks"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allFilled && !showFeedback}
        showSubmitButton={true}
        submitLabel="Check"
        timerValue={hasPlayed ? timerString : "--:--"}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
          {/* Audio Player Section */}
          <div className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex flex-col items-center gap-4">
              {/* Play Button */}
              <button
                onClick={handlePlayAudio}
                disabled={isSpeaking}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  isSpeaking
                    ? "bg-white/30 animate-pulse"
                    : "bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95",
                )}
              >
                <Volume2
                  className={cn(
                    "w-10 h-10 text-white",
                    isSpeaking && "animate-pulse",
                  )}
                />
              </button>

              {/* Replay hint */}
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Click to {hasPlayed ? "replay" : "play"} audio</span>
              </div>
            </div>
          </div>

          {/* Sentence with Blanks */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xl leading-relaxed text-center">
              {renderSentence()}
            </p>
          </div>

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
