import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy Data
const QUESTIONS = [
  {
    id: 1,
    description: "Un chat dort sur le canapé",
    images: [
      {
        id: "img1",
        src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
        isCorrect: false,
      },
      {
        id: "img2",
        src: "https://images.unsplash.com/photo-1541781777621-af13943727dd?w=400&q=80", // Sleeping cat-ish
        isCorrect: true, // Let's simplify and make one correct. In real app, we need specific images.
        // For now using random unsplash cat images.
      },
      {
        id: "img3",
        src: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=80",
        isCorrect: false,
      },
      {
        id: "img4",
        src: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80",
        isCorrect: false,
      },
    ],
  },
  {
    id: 2,
    description: "Une femme mange une pomme",
    images: [
      {
        id: "img1",
        src: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&q=80",
        isCorrect: true,
      },
      {
        id: "img2",
        src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
        isCorrect: false,
      },
      {
        id: "img3",
        src: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80",
        isCorrect: false,
      },
      {
        id: "img4",
        src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
        isCorrect: false,
      },
    ],
  },
];

export default function MatchDescToImagePage() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

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
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedImageId(null);
      setIsChecked(false);
    } else {
      // Game over or restart
      alert(
        `Game Over! Score: ${score + (selectedImageId === currentQuestion.images.find((i) => i.isCorrect).id ? 0 : 0)}/${QUESTIONS.length}`,
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
          {currentQuestionIndex + 1} / {QUESTIONS.length}
        </div>
      </div>

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
              {currentQuestionIndex < QUESTIONS.length - 1
                ? "Next Question"
                : "Finish Practice"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
