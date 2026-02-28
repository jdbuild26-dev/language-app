import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import {
  BookOpen,
  XCircle,
  CheckCircle,
  XCircle as XIcon,
  Loader2,
} from "lucide-react";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import AccentKeyboard from "@/components/ui/AccentKeyboard";

// Fallback mock data for Write Sentence Completion (Passage-based)
const MOCK_DATA = {
  passageTitle: "La Révolution du Travail Hybride",
  passageSubtitle: "Comment les entreprises s'adaptent à la nouvelle ère",
  passageContent: [
    "Depuis 2020, le monde du travail a connu une transformation radicale. Le modèle traditionnel du '9 à 5' au bureau est de plus en plus remplacé par des structures hybrides. Cette flexibilité permet aux employés de mieux équilibrer leur vie professionnelle et personnelle, tout en réduisant les temps de trajet quotidiens.",
    "Cependant, ce nouveau mode de fonctionnement apporte aussi des défis. La communication informelle entre collègues, autrefois naturelle autour d'une machine à café, doit désormais être organisée de manière intentionnelle. De plus, les managers doivent apprendre à évaluer la performance basée sur les résultats plutôt que sur le temps de présence physique.",
    "Pour réussir cette transition, les entreprises investissent massivement dans les technologies de collaboration. Les outils de vidéoconférence et de gestion de projet en ligne sont devenus essentiels. Enfin, il est crucial de maintenir une culture d'entreprise forte malgré la distance physique pour éviter l'isolement des travailleurs à domicile.",
  ],
  questions: [
    {
      id: 1,
      sentenceStart: "Le modèle hybride permet aux employés de ",
      correctEnding: "mieux équilibrer leur vie",
      hint: "better balance their lives",
    },
    {
      id: 2,
      sentenceStart:
        "Les managers doivent désormais évaluer la performance en se basant sur ",
      correctEnding: "les résultats",
      hint: "the results",
    },
    {
      id: 3,
      sentenceStart: "Pour éviter l'isolement, il est essentiel de maintenir ",
      correctEnding: "une culture d'entreprise forte",
      hint: "a strong company culture",
    },
  ],
  timeLimitSeconds: 300,
};

export default function WriteSentenceCompletionPage() {
  const handleExit = usePracticeExit();

  const [exerciseData, setExerciseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInputs, setUserInputs] = useState({}); // { 1: "text", 2: "text" }
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPassageOpen, setIsPassageOpen] = useState(false);
  const [focusedQuestionId, setFocusedQuestionId] = useState(null);

  // Fetch data from backend, fallback to mock
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchPracticeQuestions(
          "sentence_completion_writing",
        );
        if (response && response.data && response.data.length > 0) {
          const item = response.data[0]; // Use first exercise
          const content = item.content || item;
          const data = {
            passageTitle:
              content.passageTitle ||
              item.passageTitle ||
              MOCK_DATA.passageTitle,
            passageSubtitle:
              content.passageSubtitle ||
              item.passageSubtitle ||
              MOCK_DATA.passageSubtitle,
            passageContent:
              content.passageContent ||
              item.passageContent ||
              MOCK_DATA.passageContent,
            questions:
              content.questions || item.questions || MOCK_DATA.questions,
            timeLimitSeconds:
              content.timeLimitSeconds || item.timeLimitSeconds || 300,
          };

          setExerciseData(data);
        } else {
          console.warn(
            `[DATA_SOURCE] WriteSentenceCompletionPage: BACKEND returned empty data. Falling back to MOCK_DATA.`,
          );
          setExerciseData(MOCK_DATA);
        }
      } catch (error) {
        console.error(
          `[DATA_SOURCE] WriteSentenceCompletionPage: BACKEND fetch FAILED. Falling back to MOCK_DATA.`,
          error,
        );
        setExerciseData(MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const timerDuration = exerciseData?.timeLimitSeconds || 300;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleSubmit();
      }
    },
    isPaused: isCompleted || showFeedback,
  });

  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleInputChange = (id, value) => {
    if (showFeedback) return;
    setUserInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    let correctCount = 0;
    const totalQuestions = exerciseData.questions.length;

    exerciseData.questions.forEach((q) => {
      const userNorm = normalize(userInputs[q.id]);
      const correctNorm = normalize(q.correctEnding);
      if (userNorm === correctNorm) {
        correctCount++;
      }
    });

    const verifyAllCorrect = correctCount === totalQuestions;
    setIsCorrect(verifyAllCorrect);
    setScore(correctCount);

    if (verifyAllCorrect) {
      setFeedbackMessage(getFeedbackMessage(true));
    } else {
      setFeedbackMessage(
        `Vous avez ${correctCount} sur ${totalQuestions} réponses correctes.`,
      );
    }

    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setIsCompleted(true);
    handleExit();
  };

  const allAnswered =
    exerciseData?.questions?.every(
      (q) => (userInputs[q.id] || "").trim().length > 0,
    ) || false;
  const progress = exerciseData?.questions?.length
    ? (Object.keys(userInputs).length / exerciseData.questions.length) * 100
    : 0;

  if (isLoading || !exerciseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Sentence Completion"
        instructionFr="Complétez les phrases selon le texte"
        instructionEn="Complete the sentences based on the passage"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={exerciseData.questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        isSubmitEnabled={allAnswered && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6 p-4 h-full md:items-stretch overflow-hidden">
          {/* Left Column: Passage (Hidden on mobile, shown on lg) */}
          <div className="hidden lg:flex flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {exerciseData.passageTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                {exerciseData.passageSubtitle}
              </p>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="text-base leading-relaxed text-slate-700 dark:text-slate-300 space-y-6">
                {exerciseData.passageContent.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Divider (visible on lg screens) */}
          <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700 self-stretch my-4" />

          {/* Right Column: Questions & Inputs */}
          <div className="flex-1 flex flex-col justify-start lg:max-w-xl overflow-hidden">
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 h-full overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8 px-2">
                Questions
              </h2>

              <div className="space-y-10">
                {exerciseData.questions.map((q) => {
                  const userVal = userInputs[q.id] || "";
                  const isCorrectAnswer =
                    normalize(userVal) === normalize(q.correctEnding);

                  return (
                    <div key={q.id} className="flex flex-col gap-4 group">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-sm text-blue-600 border border-blue-100 dark:border-blue-800 mt-0.5">
                          {q.id}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                            {q.sentenceStart}
                            <span className="inline-block border-b-2 border-slate-300 dark:border-slate-600 min-w-[120px] ml-1 h-6"></span>
                          </p>
                        </div>
                      </div>

                      <div className="pl-12 space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={userVal}
                            onChange={(e) =>
                              handleInputChange(q.id, e.target.value)
                            }
                            onFocus={() => setFocusedQuestionId(q.id)}
                            disabled={showFeedback}
                            placeholder="Complete the sentence..."
                            className={cn(
                              "w-full p-4 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none transition-all text-base",
                              showFeedback
                                ? isCorrectAnswer
                                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300"
                                  : "border-red-500 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-300"
                                : "border-slate-100 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5",
                            )}
                          />
                          {showFeedback && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {isCorrectAnswer ? (
                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                              ) : (
                                <XIcon className="w-6 h-6 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>

                        {showFeedback && !isCorrectAnswer && (
                          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                              Correct Ending:
                            </p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                              {q.correctEnding}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Accent Keyboard */}
              {!showFeedback && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 text-center">
                    Click an accent to insert it into the focused answer
                  </p>
                  <AccentKeyboard
                    disabled={showFeedback || !focusedQuestionId}
                    onAccentClick={(char) => {
                      if (!focusedQuestionId) return;
                      setUserInputs((prev) => ({
                        ...prev,
                        [focusedQuestionId]:
                          (prev[focusedQuestionId] || "") + char,
                      }));
                    }}
                  />
                </div>
              )}

              {/* Mobile Only: Floating See Passage Button */}
              {!showFeedback && !isPassageOpen && (
                <div className="fixed bottom-24 right-6 z-40 lg:hidden">
                  <button
                    onClick={() => setIsPassageOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 animate-in slide-in-from-bottom duration-500"
                  >
                    <BookOpen className="w-5 h-5" />
                    Afficher le texte
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Passage Modal for Mobile */}
      {isPassageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {exerciseData.passageTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-tight">
                  Lisez attentivement
                </p>
              </div>
              <button
                onClick={() => setIsPassageOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 leading-relaxed space-y-6">
              {exerciseData.passageContent.map((paragraph, idx) => (
                <p key={idx} className="text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setIsPassageOpen(false)}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
              >
                Retour aux questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel="TERMINER"
        />
      )}
    </>
  );
}
