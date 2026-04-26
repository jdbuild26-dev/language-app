"use client";

import React, { useState, useEffect } from "react";
import { Volume2, RotateCcw, Languages } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";

type AnswerOption = "True" | "False" | "Not Given";

export default function AudioFillInTheBlanksDropdownPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const [playingRecordingId, setPlayingRecordingId] = useState<number | null>(
    null,
  );
  const [isCompleted, setIsCompleted] = useState(false);

  const passage =
    "Les Français aiment le fromage. Il existe plus de 300 variétés de fromage en France. Le camembert et le brie sont parmi les plus populaires.";

  const audioRecordings = [
    { id: 1, label: "AUDIO 1", text: "Les Français aiment le fromage." },
    {
      id: 2,
      label: "AUDIO 2",
      text: "Il existe plus de 300 variétés de fromage en France.",
    },
    {
      id: 3,
      label: "AUDIO 3",
      text: "Le camembert et le brie sont parmi les plus populaires.",
    },
    {
      id: 4,
      label: "AUDIO 4",
      text: "Le camembert et le brie sont parmi les plus populaires.",
    },
  ];

  const questions = [
    {
      id: 1,
      text: "Le camembert est un fromage français populaire.",
      answer: "True" as AnswerOption,
    },
    {
      id: 2,
      text: "Il existe exactement 300 variétés de fromage en France.",
      answer: "False" as AnswerOption,
    },
    {
      id: 3,
      text: "Le brie est parmi les fromages les plus populaires.",
      answer: "True" as AnswerOption,
    },
    {
      id: 4,
      text: "Les Français n'aiment pas le fromage.",
      answer: "False" as AnswerOption,
    },
    {
      id: 5,
      text: "Le texte mentionne la fabrication du camembert.",
      answer: "Not Given" as AnswerOption,
    },
  ];

  const [answers, setAnswers] = useState<Record<number, AnswerOption | undefined>>({});
  const [score, setScore] = useState(0);

  const playRecording = (id: number, text: string, rate = 0.9) => {
    setPlayingRecordingId(id);
    speak(text, "fr-FR", rate);
  };

  useEffect(() => {
    if (!isSpeaking) {
      setPlayingRecordingId(null);
    }
  }, [isSpeaking]);

  const handleAnswerChange = (questionId: number, value: AnswerOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correctCount++;
      }
    });
    setScore((correctCount / questions.length) * 100);
    setIsCompleted(true);
  };

  const progress = (1 / questions.length) * 100;
  const isSubmitEnabled = Object.keys(answers).length === questions.length;

  return (
    <PracticeGameLayout
      questionTypeFr="L'affirmation est-elle vraie, fausse, ou non mentionnée?"
      questionTypeEn="Is the statement true, false, or not given?"
      instructionFr="L'affirmation est-elle vraie, fausse, ou non mentionnée?"
      instructionEn="Listen and choose true, false, or not given"
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={handleExit}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={isSubmitEnabled}
      showSubmitButton={true}
      submitLabel="CHECK"
      timerValue=""
    >
      <div className="flex flex-col flex-1 min-h-0 w-full p-3 sm:p-4 md:p-5">
        <div className="flex flex-col flex-1 min-h-0 gap-4 md:grid md:grid-cols-2 md:gap-5 md:overflow-hidden md:h-full">
          <div className="w-full md:min-h-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 p-4 flex flex-col h-full overflow-hidden">
            <h3 className="text-xs tracking-widest font-semibold text-slate-400 mb-4">
              AUDIO RECORDINGS
            </h3>

            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
              {audioRecordings.map((recording) => {
                const isThisPlaying = isSpeaking && playingRecordingId === recording.id;

                return (
                  <div
                    key={recording.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs tracking-[0.2em] font-semibold text-blue-600 mb-2">
                          {recording.label}
                        </p>
                        <p className="text-[20px] md:text-[22px] leading-[1.35] font-medium text-slate-700 dark:text-slate-200">
                          {recording.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playRecording(recording.id, recording.text, 0.9)}
                          className={cn(
                            "w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center transition-colors",
                            isThisPlaying
                              ? "text-blue-600"
                              : "text-slate-400 hover:text-slate-600",
                          )}
                        >
                          <Volume2 className={cn("w-4 h-4", isThisPlaying && "animate-pulse")} />
                        </button>

                        <button
                          type="button"
                          onClick={() => playRecording(recording.id, recording.text, 0.75)}
                          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full md:min-h-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 p-4 flex flex-col h-full overflow-hidden">
            <div className="flex items-start gap-2 mb-4 shrink-0">
              <Languages className="w-4 h-4 mt-1 text-orange-500 shrink-0" />
              <p className="text-[20px] md:text-[22px] leading-[1.35] font-semibold text-slate-800 dark:text-slate-100">
                {passage}
              </p>
            </div>

            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
              {questions.map((question, index) => {
                const selected = answers[question.id];
                const isCorrect = isCompleted && selected === question.answer;
                const isWrong = isCompleted && selected && selected !== question.answer;

                return (
                  <div
                    key={question.id}
                    className={cn(
                      "rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 p-4",
                      isCompleted && isCorrect && "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30",
                      isCompleted && isWrong && "border-rose-300 bg-rose-50 dark:bg-rose-950/30",
                    )}
                  >
                    <p className="text-[20px] md:text-[22px] leading-[1.35] font-medium text-slate-700 dark:text-slate-200 mb-3">
                      <span className="text-blue-600 font-semibold mr-2">{index + 1}.</span>
                      {question.text}
                    </p>

                    <div className="flex flex-wrap gap-5 pl-8">
                      {(["True", "False", "Not Given"] as AnswerOption[]).map((option) => (
                        <label key={option} className="inline-flex items-center gap-2 cursor-pointer text-[18px] leading-7 text-slate-500 dark:text-slate-300">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={selected === option}
                            onChange={() => handleAnswerChange(question.id, option)}
                            disabled={isCompleted}
                            className="h-4 w-4 accent-slate-500"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
