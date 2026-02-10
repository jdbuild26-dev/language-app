import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";

export default function AudioFillInTheBlanksProPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking, pause, resume, isPaused, cancel } =
    useTextToSpeech();
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mock Data
  const audioText =
    "Bonjour à tous. Aujourd'hui nous allons parler de la technologie et de son impact sur notre vie quotidienne. Les smartphones sont devenus indispensables pour beaucoup de gens. Ils nous permettent de rester connectés avec nos amis et notre famille, mais ils peuvent aussi être une source de distraction. Il est important de trouver un équilibre.";

  const questions = [
    {
      id: 1,
      question: "De quoi allons-nous parler aujourd'hui ?",
      before: "Aujourd'hui nous allons parler de",
      answer: "la technologie",
      after: ".",
    },
    {
      id: 2,
      question: "Quel appareil est devenu indispensable ?",
      before: "Les",
      answer: "smartphones",
      after: "sont devenus indispensables.",
    },
    {
      id: 3,
      question: "Que permettent-ils de faire ?",
      before: "Ils nous permettent de rester",
      answer: "connectés",
      after: "avec nos amis.",
    },
    {
      id: 4,
      question: "Quelle peut être une conséquence négative ?",
      before: "Ils peuvent aussi être une source de",
      answer: "distraction",
      after: ".",
    },
    {
      id: 5,
      question: "Que faut-il faire ?",
      before: "Il est important de trouver un",
      answer: "équilibre",
      after: ".",
    },
    {
      id: 6,
      question: "Que sont les smartphones pour beaucoup de gens ?",
      before: "Les smartphones sont",
      answer: "indispensables",
      after: "pour beaucoup de gens.",
    },
  ];

  const [inputs, setInputs] = useState({});
  const [score, setScore] = useState(0);

  const handlePlay = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
        setIsPlaying(true);
      } else {
        pause();
        setIsPlaying(false);
      }
    } else {
      setHasStarted(true);
      setIsPlaying(true);
      speak(audioText, "fr-FR", 0.9);
    }
  };

  const handleRewind = () => {
    cancel();
    setHasStarted(true);
    setIsPlaying(true);
    speak(audioText, "fr-FR", 0.9);
  };

  // Monitor isSpeaking to detect end of playback
  useEffect(() => {
    if (hasStarted && !isSpeaking && !isPaused) {
      setIsPlaying(false);
    }
  }, [isSpeaking, hasStarted, isPaused]);

  const handleChange = (id, value) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    // Simple validation (can be enhanced)
    setIsCompleted(true);
  };

  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  return (
    <PracticeGameLayout
      questionTypeFr="Remplir les blancs"
      questionTypeEn="Audio Fill in the Blanks"
      instructionFr="Écoutez l'audio et complétez les phrases"
      instructionEn="Listen to the audio and fill in the blanks"
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={handleExit}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={Object.keys(inputs).length === questions.length}
      showSubmitButton={hasStarted}
      submitLabel="CHECK"
      timerValue=""
    >
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 space-y-6">
        {/* Sticky Audio Player */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md w-full -mx-4 px-4 py-4 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-6 shadow-inner relative overflow-hidden">
              {/* Audio Wave Animation Background */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
                  <div className="flex gap-1 h-full items-center justify-center w-full">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-blue-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                          animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 z-10">
                <button
                  onClick={handlePlay}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                    isPlaying
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white",
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 ml-1 fill-current" />
                  )}
                </button>

                {hasStarted && (
                  <button
                    onClick={handleRewind}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-md hover:shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 active:scale-95"
                    title="Restart Audio"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2 z-10">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {isPlaying
                    ? "Playing audio..."
                    : isPaused
                      ? "Audio paused"
                      : hasStarted
                        ? "Audio complete"
                        : "Tap play to start"}
                </p>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  {isPlaying && (
                    <div className="h-full bg-blue-500 w-full animate-progress" />
                  )}
                  {!isPlaying && isPaused && (
                    <div className="h-full bg-amber-500 w-1/2" />
                  )}
                  {!isPlaying && !isPaused && hasStarted && (
                    <div className="h-full bg-blue-500 w-full" />
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              {!hasStarted
                ? "Listen to the scenario carefully and answer the questions below."
                : "You can pause, replay, or restart the audio as needed."}
            </p>
          </div>
        </div>

        {/* Questions Area */}
        <div className="w-full space-y-6 pb-8">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={cn(
                "bg-white dark:bg-slate-950 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-500",
                hasStarted ? "opacity-100" : "opacity-50 pointer-events-none",
              )}
            >
              <h3 className="font-medium text-slate-900 dark:text-white mb-4 flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                {q.question}
              </h3>

              <div className="flex flex-wrap items-baseline gap-2 text-lg leading-loose text-slate-700 dark:text-slate-300 pl-9">
                <span>{q.before}</span>
                <input
                  type="text"
                  value={inputs[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  disabled={!hasStarted}
                  className="border-b-2 border-slate-300 dark:border-slate-700 bg-transparent px-2 py-0.5 min-w-[160px] text-blue-600 dark:text-blue-400 font-medium focus:outline-none focus:border-blue-500 text-center transition-colors disabled:opacity-30"
                />
                <span>{q.after}</span>
              </div>
            </div>
          ))}

          {!hasStarted && (
            <div className="text-center p-8 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800">
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                Click the play button above to start the audio and unlock the
                questions
              </p>
            </div>
          )}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
