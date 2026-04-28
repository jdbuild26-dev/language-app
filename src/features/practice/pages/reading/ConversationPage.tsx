"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { User, Volume2, XCircle, Languages, Loader2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type ConversationOption = { id: string | number; text: string };
type ConversationExchange = {
  speaker?: string;
  speakerText: string;
  speakerText_en?: string;
  questionText?: string;
  correctOptionId: string | number;
  options: ConversationOption[];
};
type ConversationData = {
  title?: string;
  scenario?: string;
  exchanges: ConversationExchange[];
};
type ConversationHistoryItem = {
  speaker?: string;
  speakerText: string;
  speakerText_en?: string;
  userText: string;
  userOptionId: string | number | null;
  wasCorrect: boolean;
};
type MistakeItem = { question: string; expected: string; actual: string };

export default function ConversationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>}>
      <ConversationContent />
    </Suspense>
  );
}

function ConversationContent() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const { learningLang = "fr" } = useLanguage() as { learningLang?: string };

  // Current conversation data
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [allConversations, setAllConversations] = useState<ConversationData[]>([]);
  const [convIndex, setConvIndex] = useState(0);

  // Current turn/exchange index (0-based)
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // User's selected option for current turn
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);

  // Whether user has submitted their answer for current turn
  const [hasAnswered, setHasAnswered] = useState(false);

  // Conversation history: array of {speakerText, userText, isRevealed}
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);

  // Mistakes history
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExchange = conversation?.exchanges?.[currentTurnIndex];
  const totalExchanges = conversation?.exchanges?.length || 0;

  // Is this exchange interactive (has options) or just a dialogue line to read?
  const isInteractive = !!(currentExchange?.options && currentExchange.options.length > 0);
  // Is the entire conversation dialogue-only (no exchange has options)?
  const isDialogueOnly = !!(conversation?.exchanges?.every(ex => !ex.options || ex.options.length === 0));

  const { pick, showQuestionInKnown } = useQuestionLanguage((conversation as any)?.level);
  // Question shown in level-based language
  const questionText = showQuestionInKnown
    ? ((currentExchange as any)?.questionText_en || currentExchange?.questionText || "Select the best response")
    : (currentExchange?.questionText || "Sélectionnez la meilleure réponse");

  usePracticeComplete({ isGameOver: isCompleted, score, totalQuestions: totalExchanges, exerciseType: "conversation_dialogue", level: (conversation as any)?.level });

  // Timer logic
  const timerDuration = 45;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!currentExchange || isCompleted || showFeedback || hasAnswered || !isInteractive) return;
      const correctOptionObj = currentExchange.options.find(
        (opt) => opt.id === currentExchange.correctOptionId,
      );
      setMistakes((prev) => [...prev, { question: currentExchange.speakerText, expected: correctOptionObj?.text || "", actual: "" }]);
      setConversationHistory((prev) => [...prev, { speakerText: currentExchange.speakerText, userText: "", userOptionId: null, wasCorrect: false }]);
      setHasAnswered(true);
      setIsCorrect(false);
      setFeedbackMessage("Time's up!");
      setShowFeedback(true);
    },
    isPaused: isCompleted || showFeedback || loading || hasAnswered || !isInteractive,
  });

  // Auto-advance removed — dialogue-only mode uses manual Next button

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await loadMockCSV("practice/reading/reading_conversation.csv", { tag });
        const raw = Array.isArray(data) ? data : [];
        const mapped: ConversationData[] = raw.map((item: any) => {
          const c = item.content || item;
          // Parse exchanges — may be JSON string or already parsed
          let exchanges = c.exchanges || item.exchanges || [];
          if (typeof exchanges === 'string') {
            try { exchanges = JSON.parse(exchanges); } catch { exchanges = []; }
          }
          // Normalise each exchange for the component
          const normExchanges: ConversationExchange[] = (Array.isArray(exchanges) ? exchanges : []).map((ex: any) => {
            // speakerText: use learning lang version
            const speakerText = learningLang === 'fr'
              ? (ex.speakerText || ex.speakerText_fr || '')
              : (ex.speakerText_en || ex.speakerText || '');
            // questionText: level-based (handled below via useQuestionLanguage)
            const questionText = ex.questionText || ex.questionText_fr || '';
            const questionText_en = ex.questionText_en || ex.questionText || '';
            // options: always in learning lang (FR), with EN for translation
            const options: ConversationOption[] = (ex.options || []).map((o: any) => ({
              id: o.id ?? o.index ?? 0,
              text: learningLang === 'fr' ? (o.text_fr || o.text || '') : (o.text_en || o.text || ''),
              text_fr: o.text_fr || o.text || '',
              text_en: o.text_en || '',
            }));
            return {
              speakerText,
              speakerText_en: ex.speakerText_en || ex.speakerText || '',
              speaker: ex.speaker || ex.Speaker || '',
              questionText,
              questionText_en,
              correctOptionId: ex.correctOptionId ?? ex.correctIndex ?? 0,
              options,
            };
          });
          return {
            title: learningLang === 'fr' ? (c.title_fr || item.title_fr || '') : (c.title_en || item.title_en || ''),
            title_fr: c.title_fr || item.title_fr || '',
            title_en: c.title_en || item.title_en || '',
            scenario: learningLang === 'fr' ? (c.context_fr || item.context_fr || '') : (c.context_en || item.context_en || ''),
            objectives: learningLang === 'fr' ? (c.objectives_fr || item.objectives_fr || '') : (c.objectives_en || item.objectives_en || ''),
            level: item.Level || item.level || 'B1',
            exchanges: normExchanges,
          } as ConversationData;
        }).filter(c => c.exchanges.length > 0);

        setAllConversations(mapped);
        setConversation(mapped[0] || null);
      } catch (error) {
        console.error("Error loading conversation data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, [tag, learningLang]);

  // Reset states when turn changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowFeedback(false);
    resetTimer();
  }, [currentTurnIndex, resetTimer]);

  const handleOptionSelect = (optionId: string | number) => {
    if (hasAnswered || showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!currentExchange) return;
    if (hasAnswered || selectedOption === null || showFeedback) return;

    const selectedOptionObj = currentExchange.options.find(
      (opt) => opt.id === selectedOption,
    );
    const correctOptionObj = currentExchange.options.find(
      (opt) => opt.id === currentExchange.correctOptionId,
    );
    const correct = selectedOption === currentExchange.correctOptionId;

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    setHasAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => [
        ...prev,
        {
          question: currentExchange.speakerText,
          expected: correctOptionObj?.text || "",
          actual: selectedOptionObj?.text || "",
        },
      ]);
    }

    // Add to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        speakerText: currentExchange.speakerText,
        userText: selectedOptionObj?.text || "",
        userOptionId: selectedOption,
        wasCorrect: correct,
      },
    ]);
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentTurnIndex < totalExchanges - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else if (convIndex < allConversations.length - 1) {
      // Move to next conversation
      const nextIdx = convIndex + 1;
      setConvIndex(nextIdx);
      setConversation(allConversations[nextIdx]);
      setCurrentTurnIndex(0);
      setConversationHistory([]);
      setMistakes([]);
      setScore(0);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress =
    totalExchanges > 0 ? ((currentTurnIndex + 1) / totalExchanges) * 100 : 0;

  const customEndGameContent =
    mistakes.length > 0 ? (
      <div className="w-full max-w-2xl text-left bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mt-4 max-h-[60vh] md:max-h-[400px] overflow-y-auto mx-auto mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <XCircle className="w-6 h-6" /> Let's review your mistakes
        </h3>
        <div className="space-y-6">
          {mistakes.map((m, i) => (
            <div
              key={i}
              className="pb-6 border-b last:border-0 border-slate-100 dark:border-slate-700 last:pb-0"
            >
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </span>
                <span className="pt-1">{m.question}</span>
              </p>
              <div className="ml-11 space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 w-16 shrink-0 mt-0.5">
                    You Said:
                  </span>
                  <span className="text-sm text-red-600 dark:text-red-400 line-through opacity-80">
                    {m.actual}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 w-16 shrink-0 mt-0.5">
                    Correct:
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {m.expected}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <PracticeGameLayout
      questionType="Running Conversation"
      questionTypeFr="Conversation continue"
      questionTypeEn="Running Conversation"
      instructionFr="Participez à la conversation"
      instructionEn="Choose the best response to continue the conversation"
      localizedInstruction={conversation?.title || conversation?.scenario || "Running Conversation"}
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={totalExchanges}
      currentQuestionIndex={currentTurnIndex}
      questionCounterValue={currentTurnIndex + 1}
      feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      onExit={handleExit}
      onNext={handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={isInteractive && selectedOption !== null && !showFeedback && !hasAnswered}
      showSubmitButton={isInteractive && !showFeedback && !hasAnswered}
      submitLabel="Submit Answer"
      timerValue={isInteractive ? timerString : ""}
      customEndGameContent={customEndGameContent}
    >
      {/* ── DIALOGUE-ONLY MODE: show full conversation as readable chat ── */}
      {isDialogueOnly ? (
        <div className="practice-reading-page-shell flex flex-col gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
          <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-3 border-b-[2px] border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Conversation</span>
              <span className="text-xs text-slate-400">{currentTurnIndex + 1} / {totalExchanges}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
              {/* Show all exchanges up to and including currentTurnIndex */}
              {(() => {
                const visible = conversation?.exchanges?.slice(0, currentTurnIndex + 1) || [];
                // Determine the two speakers for left/right alignment
                const firstSpeaker = visible[0]?.speaker || "";
                return visible.map((ex, idx) => {
                  const isRight = ex.speaker && ex.speaker !== firstSpeaker;
                  return (
                    <div key={idx} className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isRight ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mb-1">
                        <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                      </div>
                      <div className={`flex flex-col gap-0.5 max-w-[75%] ${isRight ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-1">
                          {ex.speaker || `Speaker ${idx + 1}`}
                        </span>
                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm border ${isRight ? "bg-indigo-600 text-white border-indigo-500 rounded-br-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-bl-sm"}`}>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${isRight ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>{ex.speakerText}</p>
                            <button onClick={() => speak(ex.speakerText, "fr-FR")} disabled={isSpeaking}
                              className={`opacity-40 hover:opacity-80 transition-opacity shrink-0`}>
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {(ex as any).speakerText_en && (
                            <p className={`text-xs italic mt-1 ${isRight ? "text-indigo-200" : "text-slate-400"}`}>
                              {(ex as any).speakerText_en}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            {/* Next / Finish button */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => {
                  if (currentTurnIndex < totalExchanges - 1) {
                    setCurrentTurnIndex(prev => prev + 1);
                  } else {
                    setIsCompleted(true);
                  }
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {currentTurnIndex + 1 === totalExchanges ? "Finish" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      ) : (
      /* ── INTERACTIVE MODE: original two-column layout ── */
      <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
        {/* LEFT: Conversation bubbles */}
        <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b-[2px] border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
              Conversation
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {/* Past turns */}
            {conversationHistory.map((turn, index) => (
              <div key={index} className="space-y-3">
                {/* Speaker bubble */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[92%] md:max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {turn.speakerText}
                      </p>
                      <button
                        onClick={() => speak(turn.speakerText, "fr-FR")}
                        disabled={isSpeaking}
                        className="opacity-40 hover:opacity-80 transition-opacity shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="bg-teal-700 text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm max-w-[92%] md:max-w-[85%]">
                    <p className="text-sm">{turn.userText}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Current speaker message */}
            {!hasAnswered && currentExchange && (
              <div className="flex items-start gap-2">
                {/* <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-500" />
                </div> */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[92%] md:max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {currentExchange.speakerText}
                    </p>
                    <button
                      onClick={() => speak(currentExchange.speakerText, "fr-FR")}
                      disabled={isSpeaking}
                      className="opacity-40 hover:opacity-80 transition-opacity shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for user's pending reply — only when interactive */}
            {!hasAnswered && isInteractive && (
              <div className="flex justify-end">
                <div className="bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[92%] md:max-w-[85%] text-xs text-slate-400 dark:text-slate-500 italic">
                  Your response…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Objective + question + options */}
        <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-y-auto">
          {/* Objective / context card */}
          <div className="m-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <p className="text-xs font-bold border-b-2 border-gray-200 dark:border-slate-600 pb-1 uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2">
              Objective
            </p>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {(conversation as any)?.objectives || conversation?.scenario || conversation?.title}
            </p>
          </div>

          {/* Question — only for interactive exchanges */}
          {currentExchange && isInteractive && (
            <div className="px-4 py-5">
              <h3 className="practice-reading-heading flex items-center gap-2">
                <Languages className="w-4 h-4 text-orange-500 shrink-0" />
                {questionText}
              </h3>
            </div>
          )}

          {/* Dialogue-only indicator */}
          {currentExchange && !isInteractive && (
            <div className="px-4 py-5 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm font-medium">Reading conversation…</p>
            </div>
          )}

          {/* Options — only for interactive exchanges */}
          {!hasAnswered && currentExchange && isInteractive && (
            <div className="px-4 pb-6">
              <PracticeOptions
                options={currentExchange.options.map((o) => o.text)}
                selectedOption={
                  selectedOption !== null
                    ? currentExchange.options.findIndex(
                        (o) => o.id === selectedOption,
                      )
                    : null
                }
                correctIndex={currentExchange.options.findIndex(
                  (o) => o.id === currentExchange.correctOptionId,
                )}
                showFeedback={showFeedback}
                onSelect={(idx) =>
                  handleOptionSelect(currentExchange.options[idx].id)
                }
                renderLabel={(option) => option}
                renderSuffix={() => null}
                itemClassName="w-full bg-white dark:bg-slate-800 py-3 px-4 rounded-xl text-left flex items-start gap-3 border-slate-200 dark:border-slate-700 text-base font-medium leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
      )} {/* end isDialogueOnly ternary */}

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={
            !isCorrect
              ? currentExchange?.options?.find(
                  (opt) => opt.id === currentExchange?.correctOptionId,
                )?.text
              : null
          }
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentTurnIndex + 1 === totalExchanges ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </PracticeGameLayout>
  );
}
