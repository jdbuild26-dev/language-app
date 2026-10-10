"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2, Volume2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import WordTileBuilder from "@/features/practice/components/WordTileBuilder";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import TranslationExplainButton from "@/components/ui/TranslationExplainButton";
import AudioWaveform from "@/components/ui/AudioWaveform";
import speakerStyles from "@/components/ui/AudioSpeaker.module.css";
import { motion } from "framer-motion";

// Fisher-Yates shuffle algorithm
function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function firstText(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0) || "";
}

type ListenBubbleQuestion = {
  sentence: string;
  audioText: string;
  translation: string;
  wordBubbles: string[];
  timeLimitSeconds: number;
  level: string;
};

export default function ListenBubblePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <ListenBubbleContent />
    </Suspense>
  );
}

function ListenBubbleContent() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [questions, setQuestions] = useState<ListenBubbleQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordBankSlots, setWordBankSlots] = useState<(string | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState("");

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "listen_bubble",
    level: currentQuestion?.level,
  });

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
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await fetchPracticeData("listen_bubble", { tag });
        const mapped: ListenBubbleQuestion[] = (Array.isArray(data) ? data : []).map((raw: unknown) => {
          const item: Record<string, unknown> = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
          const c: Record<string, unknown> = item.content && typeof item.content === "object" && !Array.isArray(item.content)
            ? item.content as Record<string, unknown>
            : item;
          // sentence: the correct FR sentence to reconstruct
          const sentence = firstText(c.sentence, item.sentence, c.audioText, item.audioText, item["Complete Sentence_FR"], item["Complete Sentence _FR"]);
          // audioText: what gets spoken (same as sentence for this exercise)
          const audioText = firstText(c.audioText, item.audioText, sentence);
          // translation: EN equivalent
          const translation = firstText(c.translation, item.translation, item["Complete Sentence_EN"], item["Complete Sentence _EN"]);
          // wordBubbles: pre-built token list, or split from sentence
          const suppliedTokens = Array.isArray(c.bubbleTokens) ? c.bubbleTokens : Array.isArray(item.wordBubbles) ? item.wordBubbles : [];
          const wordBubbles = suppliedTokens.length > 0
            ? suppliedTokens.map(String).filter(Boolean)
            : firstText(item["BubbleTokens"])
              ? firstText(item["BubbleTokens"]).split("+").map((token) => token.trim()).filter(Boolean)
              : sentence.trim().split(/\s+/).filter(Boolean);
          // distractors: extra wrong tokens to add to the word bank
          const distractors: string[] = Array.isArray(c.distractors) ? c.distractors.map(String) : [];

          return {
            sentence,
            audioText,
            translation,
            wordBubbles: [...wordBubbles, ...distractors],
            timeLimitSeconds: Number(c.timeLimitSeconds || item.timeLimitSeconds || item.TimeLimitSeconds || item["Time Limit"] || 60),
            level: firstText(item.Level, item.level) || "A1",
          };
        }).filter((q: ListenBubbleQuestion) => q.sentence && q.wordBubbles.length > 0);
        setQuestions(mapped);
        setCurrentIndex(0);
        setSelectedWords([]);
        setWordBankSlots(mapped.length > 0 ? shuffleArray(mapped[0].wordBubbles) : []);
      } catch (error) {
        console.error("Error loading listen bubble data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [tag]);

  // Reset the timer when the question changes.
  useEffect(() => {
    if (currentQuestion) {
      resetTimer();
    }
  }, [currentIndex, currentQuestion, resetTimer]);

  const handlePlayAudio = () => {
    if (!currentQuestion) return;
    speak(currentQuestion.audioText, "fr-FR");
  };

  const handleWordSelect = (word: string, index: number) => {
    if (showFeedback || wordBankSlots[index] !== word) return;

    // Play audio for the selected word
    speak(word, "fr-FR");

    // Leave a placeholder in the bank, matching Reading's tile flow.
    setSelectedWords([...selectedWords, word]);
    const newSlots = [...wordBankSlots];
    newSlots[index] = null;
    setWordBankSlots(newSlots);
  };

  const handleWordRemove = (word: string, index: number) => {
    if (showFeedback) return;

    // Play audio for the removed word
    speak(word, "fr-FR");

    // Remove word from the answer and return it to the bank.
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    const newSlots = [...wordBankSlots];
    const emptyIndex = newSlots.findIndex((slot) => slot === null);
    if (emptyIndex !== -1) newSlots[emptyIndex] = word;
    setWordBankSlots(newSlots);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedWords.length === 0) return;

    // Normalize answers - remove punctuation and extra whitespace, lowercase
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[.,!?;:'"]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const userAnswer = normalize(selectedWords.join(" "));
    const correctAnswer = normalize(currentQuestion.sentence);
    const correct = userAnswer === correctAnswer;

    setSubmittedAnswer(selectedWords.join(" "));
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedWords([]);

    if (currentIndex < questions.length - 1) {
      setWordBankSlots(shuffleArray(questions[currentIndex + 1].wordBubbles));
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
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

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="What do you hear?"
        instructionFr="Écoutez et construisez la phrase"
        instructionEn="Listen and build the sentence"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length > 0 && !showFeedback}
        showSubmitButton
        submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "Finish" : "Continue") : "Check"}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        correctAnswer={!isCorrect ? currentQuestion.sentence : null}
        compactFeedback
        feedbackInFlow
        feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
        feedbackChildren={showFeedback ? (
          <TranslationExplainButton
            sourceSentence={currentQuestion.audioText || currentQuestion.sentence}
            correctAnswer={currentQuestion.sentence}
            userAnswer={submittedAnswer}
            isCorrect={isCorrect}
          />
        ) : null}
        timerValue={timerString}
      >
        <div className="practice-reading-page-shell mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-8 pt-8 sm:px-6 md:pt-10 xl:pt-24">
          <div className="mb-8 flex w-full justify-center xl:mb-12">
            <button
              type="button"
              onClick={handlePlayAudio}
              aria-label={isSpeaking ? "Replay the spoken sentence" : "Play the spoken sentence"}
              className="group flex min-h-[84px] w-full max-w-[600px] items-center gap-4 rounded-[22px] border border-slate-200 bg-white px-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-200 hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900"
            >
              <span className={`${speakerStyles.speakerButton} ${isSpeaking ? speakerStyles.playing : ""} flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 transition-colors group-hover:bg-sky-200 dark:bg-slate-800 dark:text-sky-400 dark:group-hover:bg-slate-700`}>
                <Volume2 className={`h-7 w-7 ${speakerStyles.speakerIcon}`} aria-hidden="true" />
              </span>
              <AudioWaveform isPlaying={isSpeaking} decorative className="flex-1" />
            </button>
          </div>

          {showFeedback && !isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full border-t border-slate-200 pb-8 pt-6 dark:border-slate-700"
            >
              <div className="flex flex-wrap justify-center gap-3" role="group" aria-label={`Correct answer: ${currentQuestion.sentence}`}>
                {currentQuestion.sentence.trim().split(/\s+/).map((word, index) => (
                  <span
                    key={`correct-${index}`}
                    className="practice-type-content rounded-2xl border border-emerald-400 bg-emerald-50 px-4 py-2.5 font-sans font-semibold text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100 xl:px-6 xl:py-3.5"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <WordTileBuilder
            selectedWords={selectedWords}
            wordBankSlots={wordBankSlots}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
            onWordSelect={handleWordSelect}
            onWordRemove={handleWordRemove}
          />
        </div>
      </PracticeGameLayout>
    </>
  );
}
