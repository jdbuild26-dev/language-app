import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";

// QUESTIONS removed - migrated to CSV

export default function MatchDescToImagePage() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/reading/match_desc_game.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
        setQuestions([]); // Ensure it's empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available or failed to load.
        </p>
        <button
          onClick={() => navigate("/practice")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Practice
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleImageClick = (imageId) => {
    if (isChecked) return;
    setSelectedImageId(imageId);
  };

  const handleCheck = () => {
    if (!selectedImageId) return;
    setIsChecked(true);

    const correctImage = currentQuestion.images.find((img) => img.isCorrect);
    if (selectedImageId === correctImage.id) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedImageId(null);
      setIsChecked(false);
    } else {
      // Game over or restart
      alert(
        `Game Over! Score: ${score + (selectedImageId === currentQuestion.images.find((i) => i.isCorrect).id ? 0 : 0)}/${questions.length}`,
      ); // Simple alert for now
      // Reset for demo
      setCurrentQuestionIndex(0);
      setSelectedImageId(null);
      setIsChecked(false);
      setScore(0);
    }
  };

  // derived state for UI
  const isCorrectSelection =
    isChecked &&
    currentQuestion.images.find((img) => img.id === selectedImageId)?.isCorrect;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/practice")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Match Description to Image
          </h1>
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="flex-1 max-w-5xl mx-auto w-full p-6 flex flex-col items-center justify-center gap-12">
            {/* Description Text */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white transition-all">
                {currentQuestion.description}
              </h2>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              {currentQuestion.images.map((image) => {
                const isSelected = selectedImageId === image.id;
                const isCorrect = image.isCorrect;

                let ringColor = "ring-transparent";
                if (isChecked) {
                  if (isCorrect) ringColor = "ring-green-500 ring-4";
                  else if (isSelected && !isCorrect)
                    ringColor = "ring-red-500 ring-4 opacity-50";
                  else ringColor = "ring-transparent opacity-50";
                } else if (isSelected) {
                  ringColor = "ring-blue-500 ring-4";
                }

                return (
                  <button
                    key={image.id}
                    onClick={() => handleImageClick(image.id)}
                    disabled={isChecked}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 group",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900",
                      ringColor,
                      !isChecked && "hover:shadow-xl hover:shadow-blue-500/10",
                    )}
                  >
                    <img
                      src={image.src}
                      alt="Option"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Badge for "Original" - mimicking screenshot logic mainly aesthetic here */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs text-white font-medium">
                      Option
                    </div>

                    {/* Selection/Result Indicator */}
                    {isChecked && isCorrect && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                      </div>
                    )}
                    {isChecked && isSelected && !isCorrect && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                          <XCircle className="w-8 h-8" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-6">
            <div className="max-w-3xl mx-auto flex items-center justify-center">
              {!isChecked ? (
                <button
                  onClick={handleCheck}
                  disabled={!selectedImageId}
                  className={cn(
                    "w-full max-w-sm py-4 rounded-xl font-bold text-lg transition-all transform",
                    selectedImageId
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed",
                  )}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className={cn(
                    "w-full max-w-sm py-4 rounded-xl font-bold text-lg transition-all transform shadow-lg hover:-translate-y-1",
                    isCorrectSelection
                      ? "bg-green-500 hover:bg-green-400 text-white shadow-green-500/25"
                      : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/25",
                  )}
                >
                  {currentQuestionIndex < questions.length - 1
                    ? "Next Question"
                    : "Finish Practice"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
