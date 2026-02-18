import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import {
  Volume2,
  Table,
  TrendingUp,
  Map,
  Workflow,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchWriteAnalysisData } from "@/services/vocabularyApi";
import { useWritingEvaluation } from "../../hooks/useWritingEvaluation";
import WritingFeedbackResult from "../../components/WritingFeedbackResult";

// Mock data for Graph / Table / Process / Map analysis
const MOCK_QUESTIONS = [
  {
    id: 1,
    type: "table",
    title: "Underground Railways Systems",
    instruction:
      "The table below gives information about the underground railway systems in six cities. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
    content: {
      headers: [
        "City",
        "Date opened",
        "Kilometres of route",
        "Passengers per year (in millions)",
      ],
      rows: [
        ["London", "1863", "394", "775"],
        ["Paris", "1900", "199", "1191"],
        ["Tokyo", "1927", "155", "1927"],
        ["Washington DC", "1976", "126", "144"],
        ["Kyoto", "1981", "11", "45"],
        ["Los Angeles", "2001", "28", "50"],
      ],
    },
    sampleAnswer:
      "Le tableau compare six systèmes de métros à travers le monde. On remarque que Londres possède le réseau le plus ancien, ouvert en 1863, et le plus long avec 394 kilomètres. Cependant, le métro de Tokyo est le plus fréquenté avec plus de 1,9 milliard de passagers par an, suivi de près par Paris. En revanche, Kyoto et Los Angeles ont les réseaux les plus récents et les moins étendus.",
    minWords: 30,
    timeLimitSeconds: 600,
  },
];

export default function WriteAnalysisPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } =
    useWritingEvaluation();

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 600;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleSubmit();
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        // Try fetching from backend first
        const data = await fetchWriteAnalysisData();
        if (data && data.length > 0) {
          console.log(
            `[DATA_SOURCE] WriteAnalysisPage: Successfully fetched from BACKEND. Count: ${data.length}`,
          );
          setQuestions(data);
        } else {
          console.warn(
            `[DATA_SOURCE] WriteAnalysisPage: BACKEND returned empty data. Falling back to MOCK_DATA. Count: ${MOCK_QUESTIONS.length}`,
          );
          setQuestions(MOCK_QUESTIONS);
        }
      } catch (error) {
        console.error(
          `[DATA_SOURCE] WriteAnalysisPage: BACKEND fetch FAILED. Falling back to MOCK_DATA. Count: ${MOCK_QUESTIONS.length}`,
          error,
        );
        // Fallback to mock data if backend fails (e.g. DNS issues)
        setQuestions(MOCK_QUESTIONS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserAnswer("");
      setShowSample(false);
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer, resetEvaluation]);

  const handlePlaySample = () => {
    if (currentQuestion) {
      speak(currentQuestion.sampleAnswer, "fr-FR");
    }
  };

  const getWordCount = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = async () => {
    if (showFeedback || isSubmitting) return;

    const result = await evaluate({
      task_type: "graph_data",
      user_text: userAnswer,
      topic: currentQuestion.title,
      reference: currentQuestion.sampleAnswer,
      context: `Instruction: ${currentQuestion.instruction}. Data: ${JSON.stringify(currentQuestion.content)}`,
    });

    if (result) {
      setIsCorrect(result.score >= 70);
      setFeedbackMessage(result.feedback);
      setShowFeedback(true);
      setShowSample(true);
      if (result.score >= 70) {
        setScore((prev) => prev + 1);
      }
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

  const wordCount = getWordCount(userAnswer);
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
  return (
    <>
      <PracticeGameLayout
        questionType="Write About a Table"
        instructionFr="Analysez le tableau en français"
        instructionEn="Analyse the table in French"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={wordCount >= 5 && !showFeedback && !isSubmitting}
        showSubmitButton={!showFeedback}
        submitLabel={isSubmitting ? "Evaluating..." : "Submit"}
        timerValue={timerString}
      >
        <div className="flex flex-col lg:flex-row w-full max-w-[90rem] mx-auto h-full min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Left Side: Data Visualization (Table/Graph) */}
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 p-6 lg:p-10 mb-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Table className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white">
                    {currentQuestion?.title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Source: International Railway Journal
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 mb-8 border border-blue-100 dark:border-blue-800">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
                  "{currentQuestion?.instruction}"
                </p>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      {currentQuestion?.content.headers.map((header, i) => (
                        <th
                          key={i}
                          className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentQuestion?.content.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors"
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side: Writing Area */}
          <div className="w-full lg:w-[480px] p-4 lg:p-8 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col min-w-0">
            <div className="flex justify-between items-end mb-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                YOUR ANALYSIS (FRENCH)
              </label>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold tracking-tight",
                  wordCount >= currentQuestion?.minWords
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                {wordCount} / {currentQuestion?.minWords} words
              </div>
            </div>

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Écrivez votre analyse ici..."
              disabled={showFeedback}
              className={cn(
                "flex-1 w-full p-6 rounded-3xl border-2 resize-none text-lg leading-relaxed shadow-inner outline-none transition-all",
                "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100",
                "placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10",
                showFeedback
                  ? "border-slate-200 dark:border-slate-800"
                  : "border-slate-100 dark:border-slate-800 focus:border-blue-500",
              )}
              autoFocus
            />

            {/* AI Evaluation Result */}
            {evaluation && (
              <div className="mt-6 w-full">
                <WritingFeedbackResult evaluation={evaluation} />
              </div>
            )}

            {/* Sample Answer Section */}
            {showSample && !evaluation && (
              <div className="mt-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 border-2 border-emerald-100 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                      Sample Answer
                    </span>
                    <button
                      onClick={handlePlaySample}
                      disabled={isSpeaking}
                      className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-emerald-600 hover:scale-110 active:scale-95 transition-all outline-none"
                    >
                      <Volume2
                        className={cn("w-5 h-5", isSpeaking && "animate-pulse")}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-emerald-800/80 dark:text-emerald-300 leading-relaxed italic">
                    {currentQuestion?.sampleAnswer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === questions.length
              ? "FINISH SESSION"
              : "NEXT TASK"
          }
        />
      )}
    </>
  );
}
