import React, { useState, useEffect, useMemo, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { cn } from "@/lib/utils";
import AudioPlayer from "../components/shared/AudioPlayer";

export default function FillInBlankGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]); // Array of typed words
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // Focus management
  const inputRefs = useRef([]);

  // Timer Hook
  const currentQuestion = questions[currentIndex];
  // Calculate duration securely
  const timerDuration = parseInt(currentQuestion?.TimeLimitSeconds) || 60;

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        // Time's up logic
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  // Extract sentence parts and hints
  const parsedSentence = useMemo(() => {
    if (!currentQuestion?.SentenceWithBlank) return { parts: [], hints: [] };

    const sentence = currentQuestion.SentenceWithBlank;
    // Regex to match [hint]
    const regex = /\[(.*?)\]/g;
    const parts = [];
    const hints = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(sentence)) !== null) {
      // Add text before the bracket
      parts.push({
        type: "text",
        content: sentence.substring(lastIndex, match.index),
      });
      // Add the hint found in brackets
      hints.push(match[1]);
      parts.push({ type: "blank", hint: match[1], index: hints.length - 1 });
      lastIndex = regex.lastIndex;
    }
    // Add remaining text
    if (lastIndex < sentence.length) {
      parts.push({ type: "text", content: sentence.substring(lastIndex) });
    }

    // Fallback for old format "______" if no brackets found
    if (hints.length === 0 && sentence.includes("______")) {
      const splitParts = sentence.split("______");
      const newParts = [];
      splitParts.forEach((part, i) => {
        newParts.push({ type: "text", content: part });
        if (i < splitParts.length - 1) {
          newParts.push({ type: "blank", hint: "...", index: i });
          hints.push("...");
        }
      });
      return { parts: newParts, hints };
    }

    return { parts, hints };
  }, [currentQuestion]);

  // Reset logic when question changes
  useEffect(() => {
    if (questions.length > 0 && !isCompleted && currentQuestion) {
      resetTimer();

      // Initialize inputs with empty strings based on hints count
      setUserInputs(new Array(parsedSentence.hints.length).fill(""));
      setShowFeedback(false);
      setIsCorrect(false);
      setFeedbackMessage("");

      // Reset refs
      inputRefs.current = inputRefs.current.slice(
        0,
        parsedSentence.hints.length,
      );

      // Auto-focus first input
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [
    currentIndex,
    questions,
    isCompleted,
    resetTimer,
    currentQuestion,
    parsedSentence,
  ]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      // MOCK DATA FOR TESTING
      // In production, we would just use the fetch call directly.
      // For now, we inject mock data to verify the UI changes.
      const mockData = [
        {
          id: "mock1",
          SentenceWithBlank: "Je vais à la [bakery] pour acheter du [bread].",
          CorrectAnswer: "boulangeriepain",
          FullSentence: "Je vais à la boulangerie pour acheter du pain.",
          Translation: "I am going to the bakery to buy bread",
          Instruction_FR: "Complétez la phrase",
          Instruction_EN: "Complete the sentence",
          TimeLimitSeconds: 60,
        },
        {
          id: "mock2",
          SentenceWithBlank: "Le [dog] court dans le [garden].",
          CorrectAnswer: "chienjardin",
          FullSentence: "Le chien court dans le jardin.",
          Translation: "The dog runs in the garden",
          Instruction_FR: "Traduisez les mots",
          Instruction_EN: "Translate the words in brackets",
          TimeLimitSeconds: 60,
        },
      ];

      // Restore original fetch when ready
      // const response = await fetchPracticeQuestions("C1_Writing_FITB");
      // if (response && response.data) setQuestions(response.data);

      setQuestions(mockData);
    } catch (err) {
      console.error("Failed to load practice questions:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const correctAns = currentQuestion.CorrectAnswer.trim()
      .toLowerCase()
      .replace(/\s+/g, ""); // Remove spaces for robust comparison if we join inputs

    // Join user inputs and normalize
    const userAnswer = userInputs
      .map((i) => i.trim())
      .join("")
      .toLowerCase();

    const correct = userAnswer === correctAns;

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Progress percentage
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <PracticeGameLayout
      questionType="Fill in the blanks - Vocabulary"
      instructionFr={currentQuestion?.Instruction_FR || "Complétez la phrase"}
      instructionEn={
        currentQuestion?.Instruction_EN ||
        "Type the French translation for the words in brackets"
      }
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={() => navigate("/vocabulary/practice")}
      onNext={showFeedback ? handleContinue : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={
        (userInputs.every((i) => i.trim() !== "") && !showFeedback) ||
        showFeedback
      }
      showSubmitButton={true}
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
      correctAnswer={null} // We handle feedback display manually
      feedbackMessage={feedbackMessage} // We handle feedback display manually but pass it for layout color logic
    >
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[400px]">
        {/* Sentence Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 w-full flex flex-col items-center">
          <div className="flex items-center gap-4 w-full justify-center">
            {/* Audio Player (Only visible after submit) */}
            {showFeedback && currentQuestion?.FullSentence && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <AudioPlayer
                  text={currentQuestion.FullSentence}
                  showTurtle={false}
                  className="mr-4" // Add spacing
                />
              </div>
            )}

            <div className="text-2xl md:text-3xl leading-relaxed font-medium text-slate-800 whitespace-nowrap overflow-x-auto text-center">
              {parsedSentence.parts.map((part, idx) => {
                if (part.type === "text") {
                  return (
                    <span key={idx} className="whitespace-pre-wrap">
                      {part.content}
                    </span>
                  );
                }
                if (part.type === "blank") {
                  const isFilled = userInputs[part.index]?.length > 0;
                  const statusColor = showFeedback
                    ? isCorrect
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-red-300 text-red-500 bg-red-50"
                    : isFilled
                      ? "border-blue-400 bg-blue-50/30"
                      : "border-slate-300 bg-slate-50";

                  return (
                    <span
                      key={idx}
                      className="relative inline-block mx-2 align-middle"
                    >
                      <input
                        ref={(el) => (inputRefs.current[part.index] = el)}
                        type="text"
                        value={userInputs[part.index] || ""}
                        onChange={(e) =>
                          handleInputChange(part.index, e.target.value)
                        }
                        placeholder={part.hint} // Show English hint as placeholder
                        disabled={showFeedback}
                        className={cn(
                          "w-[180px] h-12 px-4 rounded-xl border-2 outline-none text-center font-bold transition-all duration-200",
                          "placeholder:text-slate-400 placeholder:font-normal placeholder:text-base",
                          statusColor,
                          "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white",
                        )}
                        autoComplete="off"
                      />
                      {showFeedback && (
                        <div className="absolute -right-3 -top-3 bg-white rounded-full shadow-sm z-10">
                          {isCorrect ? (
                            <Check className="w-6 h-6 text-green-500 fill-green-100 p-1 rounded-full" />
                          ) : (
                            <X className="w-6 h-6 text-red-500 fill-red-100 p-1 rounded-full" />
                          )}
                        </div>
                      )}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>

        {/* Custom Feedback Display */}
        {showFeedback && (
          <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            {/* If Incorrect: Show Correct French Sentence */}
            {!isCorrect && currentQuestion?.FullSentence && (
              <div className="text-xl md:text-2xl font-medium text-slate-800">
                {currentQuestion.FullSentence}
              </div>
            )}

            {/* Always Show English Translation if available */}
            {currentQuestion?.Translation && (
              <div className="text-lg md:text-xl text-slate-500 italic font-medium">
                {currentQuestion.Translation}
              </div>
            )}
          </div>
        )}
      </div>
    </PracticeGameLayout>
  );
}
