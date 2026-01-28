import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Listen and Match exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    pairs: [
      { audioText: "Le chat", matchText: "The cat" },
      { audioText: "Le chien", matchText: "The dog" },
      { audioText: "L'oiseau", matchText: "The bird" },
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 2,
    pairs: [
      { audioText: "Bonjour", matchText: "Hello" },
      { audioText: "Bonsoir", matchText: "Good evening" },
      { audioText: "Bonne nuit", matchText: "Good night" },
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 3,
    pairs: [
      { audioText: "La pomme", matchText: "The apple" },
      { audioText: "La banane", matchText: "The banana" },
      { audioText: "L'orange", matchText: "The orange" },
    ],
    timeLimitSeconds: 60,
  },
];

// Shuffle helper
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ListenMatchPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledTexts, setShuffledTexts] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [matches, setMatches] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

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
      setShuffledTexts(
        shuffleArray(currentQuestion.pairs.map((p) => p.matchText)),
      );
      setMatches({});
      setSelectedAudio(null);
      setSelectedText(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAudio = (audioText) => {
    speak(audioText, "fr-FR");
    if (!showFeedback) {
      setSelectedAudio(audioText);
    }
  };

  const handleTextClick = (text) => {
    if (showFeedback || matches[text]) return;
    setSelectedText(text);

    if (selectedAudio) {
      // Check if match is correct
      const pair = currentQuestion.pairs.find(
        (p) => p.audioText === selectedAudio,
      );
      if (pair && pair.matchText === text) {
        setMatches((prev) => ({ ...prev, [text]: selectedAudio }));
      }
      setSelectedAudio(null);
      setSelectedText(null);
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const allMatched =
      Object.keys(matches).length === currentQuestion.pairs.length;
    const allCorrect = currentQuestion.pairs.every(
      (pair) => matches[pair.matchText] === pair.audioText,
    );

    setIsCorrect(allMatched && allCorrect);
    setFeedbackMessage(getFeedbackMessage(allMatched && allCorrect));
    setShowFeedback(true);

    if (allMatched && allCorrect) {
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

  const allMatched =
    Object.keys(matches).length === currentQuestion?.pairs.length;
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Listen and Match"
        instructionFr="Écoutez et associez les paires"
        instructionEn="Listen and match the pairs"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allMatched && !showFeedback}
        showSubmitButton={true}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          <div className="w-full grid grid-cols-2 gap-8">
            {/* Audio column */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center mb-2">
                🎧 Listen
              </h3>
              {currentQuestion?.pairs.map((pair, index) => {
                const isMatched = Object.values(matches).includes(
                  pair.audioText,
                );
                return (
                  <button
                    key={index}
                    onClick={() => handlePlayAudio(pair.audioText)}
                    disabled={isMatched}
                    className={cn(
                      "w-full py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 border-2",
                      isMatched
                        ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700"
                        : selectedAudio === pair.audioText
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400",
                    )}
                  >
                    <Volume2
                      className={cn(
                        "w-5 h-5",
                        isSpeaking &&
                          selectedAudio === pair.audioText &&
                          "animate-pulse",
                      )}
                    />
                    <span className="font-medium">
                      {isMatched ? pair.audioText : `Audio ${index + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Text column */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center mb-2">
                📝 Match
              </h3>
              {shuffledTexts.map((text, index) => {
                const isMatched = matches[text];
                return (
                  <button
                    key={index}
                    onClick={() => handleTextClick(text)}
                    disabled={isMatched}
                    className={cn(
                      "w-full py-4 px-4 rounded-xl text-center font-medium transition-all duration-200 border-2",
                      isMatched
                        ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700"
                        : selectedText === text
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-200",
                    )}
                  >
                    {text}
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
