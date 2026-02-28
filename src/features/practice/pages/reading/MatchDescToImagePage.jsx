import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import TranslationBubble from "@/features/practice/components/shared/TranslationBubble";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// Simple dictionary for demo translations
const TRANSLATIONS = {
  Une: "A",
  femme: "woman",
  mange: "is eating",
  une: "an",
  pomme: "apple",
  Le: "The",
  chat: "cat",
  dort: "is sleeping",
  sur: "on",
  le: "the",
  lit: "bed",
  Un: "A",
  garçon: "boy",
  court: "runs",
  dans: "in",
  parc: "park",
  L: "The",
  homme: "man",
  livre: "book",
  La: "The",
  fille: "girl",
  boit: "drinks",
  eau: "water",
};

export default function MatchDescToImagePage() {
  const handleExit = usePracticeExit();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/reading/match_desc_game.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
        setQuestions([]);
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
          onClick={handleExit}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Practice
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleImageClick = (imageId) => {
    if (showFeedback) return;
    setSelectedImageId(imageId);
  };

  const handleSubmit = () => {
    if (!selectedImageId || showFeedback) return;

    const correctImage = currentQuestion.images.find((img) => img.isCorrect);
    const correct = selectedImageId === correctImage.id;

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedImageId(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/400?text=Image+Not+Found";
  };

  // Helper to render interactive sentence with translation bubbles
  const renderInteractiveDescription = (text) => {
    return text.split(" ").map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]/g, "");
      const translation = TRANSLATIONS[cleanWord] || "?";

      return (
        <React.Fragment key={index}>
          <TranslationBubble text={word} translation={translation} />
          {index < text.split(" ").length - 1 && " "}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Match Description to Image"
        instructionFr="Choisissez l'image qui correspond"
        instructionEn="Choose the image that matches the description"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedImageId !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
      >
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-6 gap-10">
          {/* Description Text with Translation Bubbles */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white leading-relaxed">
              {renderInteractiveDescription(currentQuestion.description)}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Hover over words for translation
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {currentQuestion.images.map((image) => {
              const isSelected = selectedImageId === image.id;
              const isImageCorrect = image.isCorrect;

              let ringColor = "ring-transparent";
              if (showFeedback) {
                if (isImageCorrect) ringColor = "ring-green-500 ring-4";
                else if (isSelected && !isImageCorrect)
                  ringColor = "ring-red-500 ring-4 opacity-50";
                else ringColor = "ring-transparent opacity-50";
              } else if (isSelected) {
                ringColor = "ring-blue-500 ring-4";
              }

              return (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(image.id)}
                  disabled={showFeedback}
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 group bg-slate-100",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "ring-offset-4 ring-offset-white dark:ring-offset-slate-900",
                    ringColor,
                    !showFeedback && "hover:shadow-xl hover:shadow-blue-500/10",
                  )}
                >
                  <img
                    src={image.src || "https://placehold.co/400?text=No+Image"}
                    alt="Option"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />

                  {/* Overlay Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs text-white font-medium">
                    Option
                  </div>

                  {/* Correct indicator */}
                  {showFeedback && isImageCorrect && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                    </div>
                  )}
                  {/* Wrong indicator */}
                  {showFeedback && isSelected && !isImageCorrect && (
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
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentQuestionIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
          }
        />
      )}
    </>
  );
}
