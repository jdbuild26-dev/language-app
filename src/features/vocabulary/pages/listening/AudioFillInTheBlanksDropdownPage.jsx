import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Loader2, Check, ChevronDown } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";

export default function AudioFillInTheBlanksDropdownPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
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
      options: ["la technologie", "la cuisine", "le sport", "la politique"],
      after: ".",
    },
    {
      id: 2,
      question: "Quel appareil est devenu indispensable ?",
      before: "Les",
      answer: "smartphones",
      options: ["ordinateurs", "tablettes", "smartphones", "télévisions"],
      after: "sont devenus indispensables.",
    },
    {
      id: 3,
      question: "Que permettent-ils de faire ?",
      before: "Ils nous permettent de rester",
      answer: "connectés",
      options: ["isolés", "connectés", "occupés", "informés"],
      after: "avec nos amis.",
    },
    {
      id: 4,
      question: "Quelle peut être une conséquence négative ?",
      before: "Ils peuvent aussi être une source de",
      answer: "distraction",
      options: ["joie", "stress", "distraction", "revenu"],
      after: ".",
    },
    {
      id: 5,
      question: "Que faut-il faire ?",
      before: "Il est important de trouver un",
      answer: "équilibre",
      options: ["travail", "équilibre", "passe-temps", "ami"],
      after: ".",
    },
    {
      id: 6,
      question: "Que sont les smartphones pour beaucoup de gens ?",
      before: "Les smartphones sont",
      answer: "indispensables",
      options: ["inutiles", "chers", "indispensables", "dangereux"],
      after: "pour beaucoup de gens.",
    },
  ];

  const [inputs, setInputs] = useState({});
  const [score, setScore] = useState(0);

  const handlePlay = () => {
    if (isPlaying) return;

    setHasStarted(true);
    setIsPlaying(true);
    speak(audioText, "fr-FR", 0.9);
  };

  // Monitor isSpeaking to detect end of playback
  useEffect(() => {
    if (hasStarted && isPlaying && !isSpeaking) {
      setIsPlaying(false);
    }
  }, [isSpeaking, hasStarted, isPlaying]);

  const handleChange = (id, value) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    // Basic scoring
    let correctCount = 0;
    questions.forEach((q) => {
      if (inputs[q.id] === q.answer) {
        correctCount++;
      }
    });
    setScore((correctCount / questions.length) * 100);
    setIsCompleted(true);
  };

  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  return (
    <PracticeGameLayout
      questionTypeFr="Remplir les blancs (Liste déroulante)"
      questionTypeEn="Audio Fill in the Blanks (Dropdown)"
      instructionFr="Écoutez l'audio et sélectionnez la bonne réponse"
      instructionEn="Listen to the audio and select the correct answer"
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
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-6 shadow-inner">
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg hover:shadow-xl",
                  isPlaying
                    ? "bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-80"
                    : "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white",
                )}
              >
                {isPlaying ? (
                  <div className="flex gap-1 h-5 items-center">
                    <span className="w-1 bg-blue-500 h-full animate-pulse" />
                    <span
                      className="w-1 bg-blue-500 h-3/4 animate-pulse"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-1 bg-blue-500 h-1/2 animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </button>

              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {isPlaying
                    ? "Playing audio..."
                    : hasStarted
                      ? "Audio complete - Click to replay"
                      : "Tap play to start"}
                </p>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  {isPlaying && (
                    <div className="h-full bg-blue-500 w-full animate-pulse" />
                  )}
                  {!isPlaying && hasStarted && (
                    <div className="h-full bg-blue-500 w-full" />
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              {!hasStarted
                ? "Listen to the scenario carefully and answer the questions below."
                : "You can replay the audio as many times as needed."}
            </p>
          </div>
        </div>

        {/* Questions Area */}
        <div className="w-full space-y-6 pb-8">
          {questions.map((q, index) => {
            const userAnswer = inputs[q.id];
            const isCorrect = isCompleted && userAnswer === q.answer;
            const isWrong = isCompleted && userAnswer !== q.answer;

            return (
              <div
                key={q.id}
                className={cn(
                  "bg-white dark:bg-slate-950 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-500",
                  hasStarted ? "opacity-100" : "opacity-50 pointer-events-none",
                  isCompleted && isWrong ? "border-red-200 bg-red-50/50" : "",
                  isCompleted && isCorrect
                    ? "border-green-200 bg-green-50/50"
                    : "",
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
                  <div className="relative inline-block">
                    <select
                      value={inputs[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      disabled={!hasStarted || isCompleted}
                      className={cn(
                        "appearance-none border-b-2 bg-transparent px-8 py-0.5 min-w-[160px] font-medium focus:outline-none text-center transition-colors cursor-pointer",
                        !userAnswer
                          ? "border-slate-300 dark:border-slate-700 text-slate-500"
                          : "border-blue-300 text-blue-600 dark:text-blue-400",
                        isCompleted && isCorrect
                          ? "border-green-500 text-green-600"
                          : "",
                        isCompleted && isWrong
                          ? "border-red-500 text-red-600"
                          : "",
                      )}
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      {q.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <span>{q.after}</span>
                  {isCompleted && isWrong && (
                    <div className="w-full mt-2 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-top-1">
                      Correct answer: {q.answer}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

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
