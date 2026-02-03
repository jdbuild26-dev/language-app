import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// Mock data for Write Sentence Completion
const MOCK_QUESTIONS = [
    {
        id: 1,
        sentenceStart: "Bien que le temps soit pluvieux, ",
        correctEnding: "nous avons décidé de sortir.",
        hint: "we decided to go out",
        sampleAnswer: "nous avons décidé de sortir.",
        timeLimitSeconds: 60,
    },
    {
        id: 2,
        sentenceStart: "Si j'avais plus de temps libre, ",
        correctEnding: "j'apprendrais le piano.",
        hint: "I would learn the piano",
        sampleAnswer: "j'apprendrais le piano.",
        timeLimitSeconds: 60,
    },
    {
        id: 3,
        sentenceStart: "Dès que je serai arrivé à la gare, ",
        correctEnding: "je t'appellerai.",
        hint: "I will call you",
        sampleAnswer: "je t'appellerai.",
        timeLimitSeconds: 60,
    }
];

export default function WriteSentenceCompletionPage() {
    const handleExit = usePracticeExit();

    const [questions] = useState(MOCK_QUESTIONS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [score, setScore] = useState(0);

    const currentQuestion = questions[currentIndex];
    const timerDuration = currentQuestion?.timeLimitSeconds || 60;

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

    useEffect(() => {
        if (currentQuestion && !isCompleted) {
            setUserInput("");
            resetTimer();
        }
    }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

    const normalize = (str) =>
        str.toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ").trim();

    const handleSubmit = () => {
        if (showFeedback || !userInput.trim()) return;

        // In a real app, this might use fuzzy matching or AI feedback
        // For now, we compare against the correctEnding
        const userNorm = normalize(userInput);
        const correctNorm = normalize(currentQuestion.correctEnding);

        // Very basic comparison for mock purposes
        const correct = userNorm === correctNorm;

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

    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    return (
        <>
            <PracticeGameLayout
                questionType="Sentence Completion"
                instructionFr="Complétez la phrase"
                instructionEn="Complete the sentence logically"
                progress={progress}
                isGameOver={isCompleted}
                score={score}
                totalQuestions={questions.length}
                onExit={handleExit}
                onNext={handleSubmit}
                isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
                showSubmitButton={!showFeedback}
                submitLabel="Check"
                timerValue={timerString}
            >
                <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8 lg:py-16">
                    <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl lg:text-2xl text-slate-400 dark:text-slate-500 font-medium mb-6">
                            Complete the sentence:
                        </h2>

                        <div className="flex flex-col gap-6">
                            <div className="text-2xl lg:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                                <span className="text-blue-600 dark:text-blue-400">{currentQuestion?.sentenceStart}</span>
                                <span className="border-b-4 border-slate-200 dark:border-slate-700 min-w-[200px] inline-block ml-2 italic text-slate-300 dark:text-slate-600">
                                    {userInput || "..."}
                                </span>
                            </div>

                            <div className="mt-8">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                    YOUR ENDING
                                </label>
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Type your ending here..."
                                    disabled={showFeedback}
                                    className={cn(
                                        "w-full p-6 rounded-3xl border-2 text-xl transition-all outline-none resize-none bg-slate-50 dark:bg-slate-950",
                                        "placeholder:text-slate-300 dark:placeholder:text-slate-700",
                                        showFeedback
                                            ? "border-slate-200 dark:border-slate-800"
                                            : "border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                                    )}
                                    rows={2}
                                    autoFocus
                                />
                            </div>

                            {currentQuestion?.hint && !showFeedback && (
                                <div className="flex items-center gap-2 text-sm text-slate-400 italic">
                                    <span>💡</span>
                                    <span>Hint: {currentQuestion.hint}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PracticeGameLayout>

            {showFeedback && (
                <FeedbackBanner
                    isCorrect={isCorrect}
                    correctAnswer={!isCorrect ? currentQuestion.correctEnding : null}
                    onContinue={handleContinue}
                    message={feedbackMessage}
                    continueLabel={currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"}
                />
            )}
        </>
    );
}
