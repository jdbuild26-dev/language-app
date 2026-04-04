"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Volume2, Sparkles, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { loadMockCSV } from "@/utils/csvLoader";

import WritingFeedbackResult from "@/components/WritingFeedbackResult";

interface Question {
  id: number;
  Question?: string;
  Prompt?: string;
  Topic?: string;
  Sentence?: string;
  Answer?: string;
  Translation?: string;
  'Correct Answer'?: string;
  Description?: string;
  Scenario?: string;
  Level?: string;
  level?: string;
  Image?: string;
  correctAnswer?: string;
}

export default function GenericSpeakingPage({
    title,
    taskType,
    sheetName,
    instructionEn,
    instructionFr,
    icon: Icon = Mic,
    mockData,
    csvName = null
}) {
    const router = useRouter();

    // Game State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Interaction State
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");
    const [evaluation, setEvaluation] = useState<any>(null); // { score, feedback, correction, pronunciation_tips }
    const [isSubmitting, setIsSubmitting] = useState(false);

    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.lang = "fr-FR";
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results as any)
                    .map((result: any) => result[0].transcript)
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
                let data: any[] = [];
                if (csvName) {
                    data = await loadMockCSV(csvName) as any[];
                } else if (mockData && mockData.length > 0) {
                    data = mockData;
                } else {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/practice/${sheetName}`
                    );
                    if (!response.ok) throw new Error("Failed to fetch data");
                    const json = await response.json();
                    data = json.data || [];
                }

                const shuffled = [...data].sort(() => 0.5 - Math.random()) as Question[];
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

        if ("speechSynthesis" in (window as any)) {
            (window as any).speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            // Try to detect if it's French or English (simplistic)
            // Usually the prompt/question is in French for speaking practice
            utterance.lang = "fr-FR";
            utterance.rate = 0.9;
            (window as any).speechSynthesis.speak(utterance);
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/practice/evaluate-speaking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task_type: taskType,
                    transcript: spokenText,
                    reference: currentQuestion?.Answer || currentQuestion?.Translation || currentQuestion?.['Correct Answer'],
                    context: currentQuestion?.Topic || currentQuestion?.Description || currentQuestion?.Scenario || title,
                    level: currentQuestion?.Level || currentQuestion?.level || "A1",
                }),
            });

            if (!response.ok) throw new Error("Failed to evaluate");
            const result = await response.json();
            setEvaluation(result);
            
            const finalScore = result.overall_score !== undefined ? result.overall_score : (result.is_correct ? 100 : 0);
            if (finalScore >= 70) {
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
                <Button onClick={() => router.push("/practice")} variant="outline" className="mt-4">Back</Button>
            </div>
        );
    }

    return (
        <PracticeGameLayout
            questionType={instructionEn}
            instructionFr={instructionFr}
            instructionEn={instructionEn}
            progress={((currentIndex + 1) / questions.length) * 100}
            score={score}
            totalQuestions={questions.length}
            isGameOver={isGameOver}
            onExit={() => router.push("/practice")}
            onNext={evaluation ? handleNext : handleSubmit}
            onRestart={handleRestart}
            isSubmitEnabled={Boolean(spokenText) && !isSubmitting}
            showSubmitButton={true}
            submitLabel={isSubmitting ? "Evaluating..." : evaluation ? "Continue" : "Submit"}
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
                  <div className="w-full animate-in slide-in-from-bottom-8 duration-700">
                    <WritingFeedbackResult 
                      evaluation={evaluation} 
                      mode="speaking" 
                      userText={spokenText}
                      onContinue={handleNext}
                    />
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
