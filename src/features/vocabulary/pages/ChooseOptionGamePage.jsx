import React, { useState, useEffect } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function ChooseOptionGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to shuffle array
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        const response = await fetchPracticeQuestions("A2_choose from options");
        const practiceData = response.data || [];

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No practice questions found.");
        }

        // Shuffle and pick a subset
        const gameQuestionsRaw = shuffleArray(practiceData).slice(0, 10);

        const generatedQuestions = gameQuestionsRaw.map((item) => {
          const options = [
            item.Option1,
            item.Option2,
            item.Option3,
            item.Option4,
          ].filter(Boolean);

          const shuffledOptions = shuffleArray(options);

          return {
            id: item.ExerciseID || Math.random().toString(),
            question: item.Question,
            correctAnswer: item.CorrectAnswer,
            options: shuffledOptions,
            questionType: item.QuestionType || "Choose from Options",
            instructionFr: item.Instruction_FR || "Choisissez la bonne réponse",
            instructionEn: item.Instruction_EN || "Select the correct option",
            image: item.ImageURL,
          };
        });

        setQuestions(generatedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load game data:", err);
        setError("Failed to load questions. Please check data source.");
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleOptionClick = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || showFeedback) return;

    const correct = selectedOption === currentQuestion.correctAnswer;
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

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const currentQuestionType = currentQuestion?.questionType;
  const currentInstructionFr = currentQuestion?.instructionFr;
  const currentInstructionEn = currentQuestion?.instructionEn;

  // Styles
  const getOptionStyle = (option) => {
    const baseStyle =
      "w-full p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 flex items-center justify-between";

    if (!showFeedback) {
      // Normal selection state
      if (option === selectedOption) {
        return `${baseStyle} bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500`;
      }
      return `${baseStyle} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-700 dark:text-gray-200`;
    }

    // Feedback state - just show selected
    if (option === selectedOption) {
      return `${baseStyle} bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300`;
    }

    return `${baseStyle} opacity-50 border-gray-100 dark:border-gray-800 text-gray-400`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType={currentQuestionType}
        instructionFr={currentInstructionFr}
        instructionEn={currentInstructionEn}
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedOption && !showFeedback}
        submitLabel="Submit"
      >
        {/* Question Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentQuestion.question}
          </h1>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={showFeedback}
              className={getOptionStyle(option)}
            >
              <span>{option}</span>
            </button>
          ))}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
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
