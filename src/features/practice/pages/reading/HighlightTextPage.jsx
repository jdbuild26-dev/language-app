import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { Button } from "@/components/ui/button";

// Mock data based on the provided image
const MOCK_QUESTIONS = [
  {
    id: 1,
    title: "PASSAGE",
    passage: `Firefighters are the people who fight fires on a nearly daily basis. They work for fire departments, which are organizations of trained professionals that keep the community safe from fires. When a fire breaks out, firefighters enter buildings to look for people and pets, rescue them, and put out the fire to prevent it from spreading. They also conduct fire drills and inspections to keep businesses and agencies safe. Firefighters must have a variety of skills and knowledge. They must be physically fit and must be able to work in harsh conditions and difficult situations. In addition to responding to fires, firefighters often help in situations that require medical attention, such as automobile accidents and gas emergencies. In addition to physical skills and knowledge, firefighters have to have strong social skills, because they must often interact with people during stressful situations.`,
    questionTitle: "Highlight text in the passage to answer the question below",
    question:
      "In addition to knowledge and physical fitness, what other skills are important for firefighters?",
    correctAnswer:
      "In addition to physical skills and knowledge, firefighters have to have strong social skills, because they must often interact with people during stressful situations.",
    timeLimitSeconds: 120,
  },
  {
    id: 2,
    title: "PASSAGE",
    passage: `Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities. This chemical energy is stored in carbohydrate molecules, such as sugars and starches, which are synthesized from carbon dioxide and water – hence the name photosynthesis, from the Greek phōs, "light", and sunthesis, "putting together". In most cases, oxygen is also released as a waste product. Most plants, most algae, and cyanobacteria perform photosynthesis; such organisms are called photoautotrophs. Photosynthesis is largely responsible for producing and maintaining the oxygen content of the Earth's atmosphere, and supplies all of the organic compounds and most of the energy necessary for life on Earth.`,
    questionTitle: "Highlight text in the passage to answer the question below",
    question: "What is the origin of the word 'photosynthesis'?",
    correctAnswer:
      'hence the name photosynthesis, from the Greek phōs, "light", and sunthesis, "putting together"',
    timeLimitSeconds: 120,
  },
];

export default function HighlightTextPage() {
  const handleExit = usePracticeExit();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  // More time for reading
  const timerDuration = currentQuestion?.timeLimitSeconds || 120;

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
      setSelectedText("");
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleMouseUp = () => {
    if (showFeedback) return;

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  // Helper to normalize strings for comparison (ignores case and simple punctuation differences)
  const normalize = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[.,;:"']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Calculate similarity for partial matches
  const calculateSimilarity = (s1, s2) => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;

    // Simple inclusion check for this use case often works better than Levenshtein for sentence highlighting
    // because users might highlight a bit more or less context.
    // But "Highlight the sentence" usually implies exact text.
    // Let's stick to a strict normalization check but maybe allow substring if it captures the core meaning.
    // For now: Strict Normalized Equality.
    return normalize(s1) === normalize(s2);
  };

  const handleSubmit = () => {
    if (showFeedback || !selectedText) return;

    // Check if the selected text basically matches the correct answer
    // We'll trust exact match after normalization for "sentence" tasks mostly,
    // but maybe allow if it's a substring of the answer or vice versa?
    // The requirement often is "Highlight the text".
    const userNorm = normalize(selectedText);
    const correctNorm = normalize(currentQuestion.correctAnswer);

    // We can allow some leniency: if user missed a period or capitalization, normalize handles it.
    // If they selected a bit too much or too little, we might need fuzzy match.
    // For now, let's assume they need to match closely.
    const correct =
      userNorm === correctNorm ||
      (correctNorm.includes(userNorm) &&
        userNorm.length > correctNorm.length * 0.8) ||
      (userNorm.includes(correctNorm) &&
        correctNorm.length > userNorm.length * 0.8);

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
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

  return (
    <>
      <PracticeGameLayout
        questionType="Highlight the Text"
        instructionFr="Surlignez le texte dans le passage"
        instructionEn="Highlight text in the passage"
        progress={((currentIndex + 1) / questions.length) * 100}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedText || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "SUBMIT ANSWER"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto h-full min-h-[500px]">
          {/* Left Column: Passage */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              {currentQuestion.title}
            </h3>
            <div
              className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-slate-800 dark:text-slate-200 select-text"
              onMouseUp={handleMouseUp}
            >
              {currentQuestion.passage}
            </div>

            {/* Visual hint that text is selectable */}
            <div className="mt-auto pt-4 text-xs text-slate-400 italic flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Select text to answer
            </div>
          </div>

          {/* Right Column: Interaction */}
          <div className="flex-1 flex flex-col justify-start">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 md:sticky md:top-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                {currentQuestion.questionTitle}
              </h2>

              <div className="mb-8">
                <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Selection Box */}
              <div
                className={cn(
                  "border-2 rounded-xl p-4 min-h-[80px] flex items-center justify-center text-center transition-all bg-slate-50 dark:bg-slate-900/50",
                  selectedText
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-slate-800 dark:text-slate-200"
                    : "border-dashed border-slate-300 dark:border-slate-600 text-slate-400",
                )}
              >
                {selectedText || "Click and drag to highlight text"}
              </div>

              {selectedText && (
                <div className="mt-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => setSelectedText("")}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
