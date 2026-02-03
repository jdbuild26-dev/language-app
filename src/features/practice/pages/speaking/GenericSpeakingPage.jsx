import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Volume2, Sparkles, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { loadMockCSV } from "@/utils/csvLoader";

export default function GenericSpeakingPage({
    title,
    taskType,
    sheetName,
    instructionEn,
    instructionFr,
    icon: Icon = Mic,
    mockData = [],
    csvName = null
}) {
    const navigate = useNavigate();

    // Game State
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Interaction State
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");
    const [evaluation, setEvaluation] = useState(null); // { score, feedback, correction, pronunciation_tips }
    const [isSubmitting, setIsSubmitting] = useState(false);

    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.lang = "fr-FR";
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map((result) => result[0].transcript)
                    .join("");
                setSpokenText(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                let data = [];
                if (csvName) {
                    data = await loadMockCSV(csvName);
                } else if (mockData && mockData.length > 0) {
                    data = mockData;
                } else {
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/practice/${sheetName}`
                    );
                    if (!response.ok) throw new Error("Failed to fetch data");
                    const json = await response.json();
                    data = json.data || [];
                }

                const shuffled = [...data].sort(() => 0.5 - Math.random());
                setQuestions(shuffled);
            } catch (error) {
                console.error("Error fetching speaking data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sheetName, mockData, csvName]);

    const currentQuestion = questions[currentIndex];

    const handlePlayAudio = () => {
        const textToSpeak = currentQuestion?.Question || currentQuestion?.Prompt || currentQuestion?.Topic || currentQuestion?.Sentence;
        if (!textToSpeak) return;

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            // Try to detect if it's French or English (simplistic)
            // Usually the prompt/question is in French for speaking practice
            utterance.lang = "fr-FR";
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleToggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setSpokenText("");
            setEvaluation(null);
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSubmit = async () => {
        if (!spokenText || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/practice/evaluate-speaking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task_type: taskType,
                    transcript: spokenText,
                    reference: currentQuestion?.Answer || currentQuestion?.Translation || currentQuestion?.['Correct Answer'],
                    context: currentQuestion?.Topic || currentQuestion?.Description || currentQuestion?.Scenario || title
                }),
            });

            if (!response.ok) throw new Error("Failed to evaluate");
            const result = await response.json();
            setEvaluation(result);
            if (result.score >= 70) {
                setScore((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Evaluation error:", error);
            alert("Failed to evaluate your speech. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        setSpokenText("");
        setEvaluation(null);
        setIsListening(false);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsGameOver(true);
        }
    };

    const handleRestart = () => {
        setScore(0);
        setCurrentIndex(0);
        setIsGameOver(false);
        setSpokenText("");
        setEvaluation(null);
        setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
    };

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
                <p className="text-xl text-slate-600 dark:text-slate-400">No questions available.</p>
                <Button onClick={() => navigate("/practice")} variant="outline" className="mt-4">Back</Button>
            </div>
        );
    }

    return (
        <PracticeGameLayout
            title={title}
            questionType={instructionEn}
            instructionFr={instructionFr}
            instructionEn={instructionEn}
            progress={((currentIndex + 1) / questions.length) * 100}
            score={score}
            totalQuestions={questions.length}
            isGameOver={isGameOver}
            onExit={() => navigate("/practice")}
            onNext={evaluation ? handleNext : handleSubmit}
            onRestart={handleRestart}
            isSubmitEnabled={Boolean(spokenText) && !isSubmitting}
            showSubmitButton={true}
            submitLabel={isSubmitting ? "Evaluating..." : evaluation ? "Continue" : "Submit"}
            showFeedback={!!evaluation}
            isCorrect={evaluation?.score >= 70}
            feedbackMessage={evaluation?.feedback || ""}
        >
            <div className="flex flex-col items-center justify-center max-w-3xl w-full gap-8">
                {/* Task Content */}
                <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        {currentQuestion.Image && (
                            <img src={currentQuestion.Image} alt="Task" className="w-full max-h-64 object-contain rounded-xl mb-4 shadow-sm" />
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                            {currentQuestion.Question || currentQuestion.Prompt || currentQuestion.Topic || currentQuestion.Sentence}
                        </h2>
                        <div className="flex justify-center mt-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePlayAudio}
                                className="rounded-full w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm transition-all hover:scale-110 active:scale-95"
                            >
                                <Volume2 className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                            </Button>
                        </div>
                        {currentQuestion.Description && (
                            <p className="text-slate-500 dark:text-slate-400 text-lg italic">
                                {currentQuestion.Description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Evaluation Result */}
                {evaluation && (
                    <div className={cn(
                        "w-full rounded-2xl p-4 md:p-6 border animate-in slide-in-from-bottom-4 duration-500",
                        evaluation.score >= 70
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                            : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                    )}>
                        <div className="flex items-center gap-3 md:gap-4 mb-3">
                            <div className={cn(
                                "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-base md:text-xl font-bold border-2 shrink-0",
                                evaluation.score >= 70 ? "bg-emerald-500 text-white border-emerald-400" : "bg-amber-500 text-white border-amber-400"
                            )}>
                                {evaluation.score}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">AI Analysis</h4>
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{evaluation.feedback}</p>
                            </div>
                        </div>

                        {evaluation.correction && (
                            <div className="mt-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <MessageCircle className="w-3 h-3" /> Recommended Phrasing
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 font-medium">{evaluation.correction}</p>
                            </div>
                        )}

                        {evaluation.pronunciation_tips && (
                            <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p><strong>Tip:</strong> {evaluation.pronunciation_tips}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mic Button & Interaction */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <div className="relative">
                        <button
                            onClick={handleToggleListening}
                            disabled={isSubmitting || !!evaluation}
                            className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed",
                                isListening
                                    ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30",
                            )}
                        >
                            <Icon className={cn("w-10 h-10", isListening && "animate-bounce")} />
                        </button>

                        {isListening && (
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <span className="text-sm font-bold text-red-500 animate-pulse flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    LISTENING...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Spoken Text Display */}
                    <div className="min-h-[80px] w-full max-w-xl bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 text-center border border-dashed border-slate-300 dark:border-slate-700">
                        {spokenText ? (
                            <p className="text-xl text-slate-700 dark:text-slate-200 font-medium italic">
                                "{spokenText}"
                            </p>
                        ) : (
                            <p className="text-slate-400 dark:text-slate-500 italic py-4">
                                Click the microphone and start speaking...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </PracticeGameLayout>
    );
}
