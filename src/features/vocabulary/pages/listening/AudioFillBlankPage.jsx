import React, { useState, useEffect } from "react";
import { fetchPracticeQuestions } from "../../../../services/vocabularyApi";
import { Loader2, Volume2, CheckCircle, XCircle } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";

export default function AudioFillBlankPage() {
  const { speak } = useTextToSpeech();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("B5_Fill blanks_Audio");
      if (response && response.data && response.data.length > 0) {
        const transformed = response.data.map((q) => ({
          id: q.ExerciseID || Math.random(),
          instruction: q.Instruction_EN || "What do you hear?",
          displaySentence: q.SentenceWithBlank || "Le ___ est dans la cuisine.",
          fullSentence: q.CompleteSentence || q.Audio || "", // Text to speak for context
          options: [q.Option1, q.Option2, q.Option3, q.Option4].filter(Boolean),
          correctAnswer: q.CorrectAnswer || q.Option1, // Fallback
        }));
        setQuestions(transformed);
      } else {
        console.warn("API returned empty, using MOCK data");
        setQuestions(MOCK_DATA);
      }
    } catch (err) {
      console.error(err);
      setQuestions(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  const MOCK_DATA = [
    {
      id: 1,
      instruction: "What do you hear?",
      displaySentence: "Le chien et le _____ jouent dans le jardin.",
      fullSentence: "Le chien et le chat jouent dans le jardin.",
      options: ["chat", "rat", "plat", "drap"],
      correctAnswer: "chat",
    },
    {
      id: 2,
      instruction: "What do you hear?",
      displaySentence: "J'aime manger des _____.",
      fullSentence: "J'aime manger des pommes.",
      options: ["pommes", "poires", "gommes", "sommes"],
      correctAnswer: "pommes",
    },
  ];

  const handleOptionSelect = (opt) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const playSentence = () => {
    const q = questions[currentIndex];
    if (q?.fullSentence) speak(q.fullSentence, "fr-FR");
  };

  const playOption = (e, text) => {
    e.stopPropagation(); // Prevent selecting when clicking play? or maybe playing selects it?
    // Design shows speaker icon inside the button.
    speak(text, "fr-FR");
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsSubmitted(false);
        setSelectedOption(null);
      } else {
        setIsCompleted(true);
      }
      return;
    }

    setIsSubmitted(true);
    const q = questions[currentIndex];
    if (selectedOption?.toLowerCase() === q.correctAnswer?.toLowerCase()) {
      setScore((prev) => prev + 1);
    }
  };

  const currentQ = questions[currentIndex];
  // Auto-play sentence on load
  useEffect(() => {
    if (!loading && !isCompleted && currentQ) {
      // speak(currentQ.fullSentence, "fr-FR");
    }
  }, [currentIndex, loading, isCompleted]);

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  let submitLabel = "Check Answer";
  if (isSubmitted)
    submitLabel = currentIndex === questions.length - 1 ? "Finish" : "Next";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );

  return (
    <PracticeGameLayout
      questionType="Audio Fill in the Blank"
      instructionFr="Écoutez et complétez la phrase"
      instructionEn={currentQ?.instruction}
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      onExit={() => (window.location.href = "/vocabulary/practice")}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={!!selectedOption}
      showSubmitButton={true}
      submitLabel={submitLabel}
    >
      <div className="flex flex-col items-center w-full max-w-3xl px-4">
        {/* Sentence & Main Audio */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
          <button
            onClick={playSentence}
            className="w-16 h-16 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700 flex items-center justify-center transition-transform active:scale-95 border-4 border-white shadow-sm"
          >
            <Volume2 className="w-8 h-8" />
          </button>
          <h2 className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-100 text-center leading-relaxed">
            {/* Render sentence with blank line */}
            {currentQ?.displaySentence.split("_____").map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block border-b-4 border-gray-400 min-w-[3rem] mx-2">
                    {isSubmitted && currentQ.correctAnswer}
                  </span>
                )}
              </React.Fragment>
            ))}
          </h2>
        </div>

        {/* Audio Options */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          {currentQ?.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = currentQ.correctAnswer === opt;

            let style =
              "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-teal-400";

            if (isSubmitted) {
              if (isCorrect)
                style = "bg-green-50 border-green-500 text-green-700";
              else if (isSelected)
                style = "bg-red-50 border-red-500 text-red-700 opacity-60";
              else style = "opacity-50";
            } else if (isSelected) {
              style =
                "bg-teal-50 border-teal-500 ring-1 ring-teal-500 shadow-md";
            }

            return (
              <div
                key={idx}
                onClick={() => handleOptionSelect(opt)}
                className={cn(
                  "relative flex items-center p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] group",
                  style
                )}
              >
                {/* Play Button for this option */}
                <button
                  onClick={(e) => playOption(e, opt)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-500 flex items-center justify-center mr-4 shrink-0 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                {/* Fake Waveform */}
                <div className="flex-1 flex items-center gap-[3px] h-8 opacity-40 group-hover:opacity-60 transition-opacity">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-current rounded-full"
                      style={{ height: `${30 + Math.random() * 70}%` }}
                    />
                  ))}
                </div>

                {/* Status Icon */}
                {isSubmitted && isCorrect && (
                  <CheckCircle className="w-6 h-6 text-green-600 ml-3" />
                )}
                {isSubmitted && isSelected && !isCorrect && (
                  <XCircle className="w-6 h-6 text-red-600 ml-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PracticeGameLayout>
  );
}
