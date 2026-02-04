import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { ClipboardList, Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// Mock data for Fill out Form exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    formTitle: "Hotel Registration",
    formTitleFr: "Inscription Hôtel",
    fields: [
      { id: "nom", label: "Nom (Last Name)", answer: "Dupont" },
      { id: "prenom", label: "Prénom (First Name)", answer: "Marie" },
      {
        id: "nationalite",
        label: "Nationalité (Nationality)",
        answer: "Française",
      },
      { id: "telephone", label: "Téléphone (Phone)", answer: "06 12 34 56 78" },
      { id: "email", label: "Email", answer: "marie.dupont@email.fr" },
    ],
    timeLimitSeconds: 120,
    ttsText:
      "Bonjour, je m'appelle Marie Dupont. Je suis française et je voudrais m'inscrire à l'hôtel. Mon numéro de téléphone est le 06 12 34 56 78 et mon email est marie.dupont@email.fr.",
  },
  {
    id: 2,
    formTitle: "Restaurant Reservation",
    formTitleFr: "Réservation Restaurant",
    fields: [
      { id: "nom", label: "Nom (Name)", answer: "Martin" },
      { id: "date", label: "Date", answer: "15 mars 2024" },
      { id: "heure", label: "Heure (Time)", answer: "20h00" },
      {
        id: "personnes",
        label: "Nombre de personnes (Number of people)",
        answer: "quatre",
      },
      { id: "telephone", label: "Téléphone (Phone)", answer: "01 23 45 67 89" },
    ],
    timeLimitSeconds: 120,
    ttsText:
      "Bonjour, je voudrais réserver une table pour quatre personnes au nom de Martin. C'est pour le 15 mars 2024 à 20h00. Vous pouvez me joindre au 01 23 45 67 89.",
  },
  {
    id: 3,
    formTitle: "Library Card Application",
    formTitleFr: "Demande de Carte de Bibliothèque",
    fields: [
      {
        id: "nom",
        label: "Nom complet (Full name)",
        answer: "Pierre Lefebvre",
      },
      {
        id: "adresse",
        label: "Adresse (Address)",
        answer: "12 rue de la Paix, Paris",
      },
      {
        id: "date_naissance",
        label: "Date de naissance (Date of birth)",
        answer: "5 juillet 1995",
      },
      { id: "profession", label: "Profession", answer: "Étudiant" },
    ],
    timeLimitSeconds: 120,
    ttsText:
      "Bonjour, je souhaite faire une demande de carte de bibliothèque. Je m'appelle Pierre Lefebvre, j'habite au 12 rue de la Paix à Paris. Je suis étudiant et je suis né le 5 juillet 1995.",
  },
];

export default function WriteFormPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking, stop } = useTextToSpeech();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 120;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        handleSubmit();
      }
    },
    isPaused: isCompleted || showFeedback || isAudioPlaying,
  });

  useEffect(() => {
    if (currentQuestion) {
      const initialValues = {};
      currentQuestion.fields.forEach((field) => {
        initialValues[field.id] = "";
      });
      setFormValues(initialValues);
      resetTimer();
    }
  }, [currentQuestion, resetTimer]);

  // Audio handling
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      handlePlayAudio();
    }
    return () => stop();
  }, [currentIndex, currentQuestion, isCompleted]);

  const handlePlayAudio = () => {
    setIsAudioPlaying(true);
    resetTimer(); // Reset timer to full duration
    speak(currentQuestion.ttsText, "fr-FR", 0.9, {
      onEnd: () => setIsAudioPlaying(false),
      onError: () => setIsAudioPlaying(false),
    });
  };

  const handleInputChange = (fieldId, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    // Check if all fields are filled
    const allFilled = currentQuestion.fields.every(
      (field) => formValues[field.id]?.trim().length > 0,
    );

    setIsCorrect(allFilled);
    setFeedbackMessage(
      allFilled ? getFeedbackMessage(true) : "Please fill in all fields.",
    );
    setShowFeedback(true);

    if (allFilled) {
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

  const allFieldsFilled = currentQuestion?.fields.every(
    (field) => formValues[field.id]?.trim().length > 0,
  );

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Fill out Form"
        instructionFr="Remplissez le formulaire"
        instructionEn="Fill out the form"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={allFieldsFilled && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4 py-4">
          {/* Form header */}
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-cyan-600" />
            <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              {currentQuestion?.formTitleFr}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {currentQuestion?.formTitle}
          </p>

          {/* Audio Player */}
          {currentQuestion?.ttsText && (
            <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayAudio}
                  disabled={isAudioPlaying}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                    isAudioPlaying
                      ? "bg-cyan-100 text-cyan-600 animate-pulse"
                      : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-md hover:scale-105",
                  )}
                >
                  <Volume2
                    className={cn("w-6 h-6", isAudioPlaying && "animate-pulse")}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {isAudioPlaying ? "Listening..." : "Listen to instructions"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click to replay (resets timer)
                  </p>
                </div>
              </div>

              {!isAudioPlaying && (
                <button
                  onClick={handlePlayAudio}
                  className="text-xs flex items-center gap-1 text-slate-500 hover:text-cyan-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Replay
                </button>
              )}
            </div>
          )}

          {/* Form fields */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              {currentQuestion?.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={formValues[field.id] || ""}
                    onChange={(e) =>
                      handleInputChange(field.id, e.target.value)
                    }
                    disabled={showFeedback}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border-2 text-base",
                      "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200",
                      "focus:outline-none focus:ring-2",
                      showFeedback
                        ? formValues[field.id]?.trim()
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-slate-200 dark:border-slate-600 focus:border-cyan-500 focus:ring-cyan-200",
                    )}
                    placeholder={`Enter ${field.label.split(" (")[0]}...`}
                  />
                  {/* Show expected answer after feedback */}
                  {showFeedback && (
                    <p className="text-xs text-slate-500 mt-1">
                      Example: {field.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
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
