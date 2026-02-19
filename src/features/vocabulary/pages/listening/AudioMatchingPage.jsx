import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, CheckCircle2 } from "lucide-react";
import AudioPlayer from "../../components/shared/AudioPlayer";
import { motion, AnimatePresence } from "framer-motion";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function AudioMatchingPage() {
  const { speak, isSpeaking } = useTextToSpeech();

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!showFeedback && !isCompleted) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: loading || isCompleted || showFeedback,
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

      const response = await fetchPracticeQuestions("A1.Match the pairs");
      if (response && response.data) {
        generateQuestions(response.data);
      }
    } catch (err) {
      console.error("[AudioMatching] ❌ Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = (data) => {
    const questionsList = [];
    const totalQuestions = 5;

    // Shuffle data
    const shuffled = [...data].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(shuffled.length, totalQuestions); i++) {
      const correctItem = shuffled[i];

      // Get 3 distractors
      const others = shuffled.filter((item) => item.id !== correctItem.id);
      const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);

      const options = [correctItem, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map((item) => ({
          id: item.id,
          text: item.English, // Display English
          audioText: item.French, // Play French
          isCorrect: item.id === correctItem.id,
        }));

      questionsList.push({
        id: i,
        promptAudio: correctItem.French,
        correctAnswer: correctItem,
        options: options,
      });
    }
    setQuestions(questionsList);
  };

  const handleOptionClick = (option) => {
    if (showFeedback) return;

    const correct = option.isCorrect;
    setSelectedOption({ id: option.id, isCorrect: correct });
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    handleNext();
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

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
        questionTypeFr="Qu'entendez-vous ?"
        questionTypeEn="What do you hear?"
        instructionFr="Écoutez et choisissez la bonne traduction"
        instructionEn="Listen and choose the correct translation"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onNext={showFeedback ? handleContinue : undefined}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={showFeedback}
        showSubmitButton={showFeedback}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={
          !isCorrect
            ? currentQ.options.find((opt) => opt.isCorrect)?.text
            : null
        }
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col items-center w-full max-w-2xl pb-32">
          {/* Audio Button */}
          <div className="mb-12">
            <AudioPlayer text={currentQ?.promptAudio || ""} />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <AnimatePresence mode="popLayout">
              {currentQ?.options.map((option) => {
                let stateStyles =
                  "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-400";
                if (selectedOption && !showFeedback) {
                  if (option.isCorrect) {
                    stateStyles =
                      "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
                  } else if (selectedOption.id === option.id) {
                    stateStyles =
                      "bg-red-50 border-red-500 text-red-700 opacity-60";
                  } else {
                    stateStyles = "opacity-50 grayscale";
                  }
                }

                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleOptionClick(option)}
                    disabled={showFeedback}
                    className={`
                                relative p-6 rounded-2xl border-2 text-lg font-medium text-left transition-all
                                ${stateStyles}
                            `}
                  >
                    <span className="flex items-center justify-between">
                      {option.text}
                      {selectedOption?.id === option.id && option.isCorrect && (
                        <CheckCircle2 className="text-green-600" />
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
